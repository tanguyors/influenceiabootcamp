// Serveur MCP distant Higgsfield : l'authentification se fait par OAuth avec le
// compte Higgsfield de l'utilisateur (aucune clé API).
const DEFAULT_MCP_URL = "https://mcp.higgsfield.ai/mcp";
const AUTH_BASE = "https://mcp.higgsfield.ai";
const CLIENT_NAME = "CAI - Cashfluencer AI";
export const SCOPES = "openid email offline_access";

export function getMcpUrl() {
  return DEFAULT_MCP_URL;
}

/* ------------------------------- OAuth ---------------------------------- */

function base64url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createPkce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const verifier = base64url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64url(new Uint8Array(digest)) };
}

export function createState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export async function registerClient(redirectUri) {
  const res = await fetch(`${AUTH_BASE}/oauth2/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: CLIENT_NAME,
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: SCOPES,
    }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.client_id) {
    throw new Error(data.error_description || data.error || `Enregistrement du client refusé (HTTP ${res.status}).`);
  }
  return data.client_id;
}

export function buildAuthorizeUrl({ clientId, redirectUri, challenge, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    resource: getMcpUrl(),
  });
  return `${AUTH_BASE}/oauth2/authorize?${params.toString()}`;
}

async function tokenRequest(form) {
  const res = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Autorisation refusée (HTTP ${res.status}).`);
  }
  return data;
}

export function exchangeCode({ clientId, code, verifier, redirectUri }) {
  return tokenRequest(new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  }));
}

export function refreshAccessToken({ clientId, refreshToken }) {
  return tokenRequest(new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  }));
}

export function decodeIdTokenClaims(idToken) {
  if (!idToken || idToken.split(".").length < 2) return null;
  const part = idToken.split(".")[1];
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4);
  try {
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/* --------------------------- Session enregistrée ------------------------ */

// Chaque utilisateur connecte son propre compte Higgsfield : la session est
// rattachée à celui qui l'a autorisée (connected_by), jamais partagée.
export async function getAuthRecord(base44, userId) {
  if (!userId) return null;
  const page = await base44.asServiceRole.entities.HiggsfieldAuth.filter(
    { connected_by: userId },
    { sort: "-created_date", limit: 1 }
  );
  return (page.items || [])[0] || null;
}

export async function saveSession(base44, { tokens, clientId, account, userId }) {
  const existing = await getAuthRecord(base44, userId);
  const data = {
    access_token: tokens.access_token || "",
    refresh_token: tokens.refresh_token || (existing && existing.refresh_token) || "",
    expires_at: Date.now() + (Number(tokens.expires_in) || 3600) * 1000,
    client_id: clientId || (existing && existing.client_id) || "",
    account: account || (existing && existing.account) || "",
    scopes: tokens.scope || SCOPES,
    connected_by: userId || (existing && existing.connected_by) || "",
  };
  if (existing) {
    await base44.asServiceRole.entities.HiggsfieldAuth.update(existing.id, data);
    return data;
  }
  await base44.asServiceRole.entities.HiggsfieldAuth.create(data);
  return data;
}

export async function clearSession(base44, userId) {
  const existing = await getAuthRecord(base44, userId);
  if (!existing) return;
  await base44.asServiceRole.entities.HiggsfieldAuth.update(existing.id, {
    access_token: "",
    refresh_token: "",
    expires_at: 0,
    account: "",
  });
}

// Jeton d'accès utilisable, rafraîchi automatiquement si nécessaire.
export async function getAccessToken(base44, userId) {
  const auth = await getAuthRecord(base44, userId);
  if (!auth || !auth.access_token) return null;
  if (auth.expires_at && auth.expires_at - Date.now() > 60000) return auth.access_token;
  if (!auth.refresh_token || !auth.client_id) return auth.access_token;
  const refreshed = await refreshAccessToken({ clientId: auth.client_id, refreshToken: auth.refresh_token });
  await saveSession(base44, { tokens: refreshed, clientId: auth.client_id, account: auth.account, userId });
  return refreshed.access_token;
}

/* ------------------------------ Transport MCP --------------------------- */

function parseBody(text, contentType) {
  if (!text) return [];
  if (contentType && contentType.includes("text/event-stream")) {
    const messages = [];
    for (const line of text.split("\n")) {
      const m = line.match(/^data:\s*(.*)$/);
      if (m && m[1].trim()) {
        try { messages.push(JSON.parse(m[1])); } catch { /* ignore */ }
      }
    }
    return messages;
  }
  try { return [JSON.parse(text)]; } catch { return []; }
}

async function postMcp(url, token, body, sessionId, timeoutMs) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "Authorization": `Bearer ${token}`,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs || 60000),
  });
  const text = await res.text();
  if (res.status === 401 || res.status === 403) {
    throw new Error("Connexion Higgsfield expirée : reconnectez votre compte depuis la page Connexion Higgsfield.");
  }
  if (!res.ok && !text) throw new Error(`Serveur MCP Higgsfield : HTTP ${res.status}`);
  return {
    messages: parseBody(text, res.headers.get("content-type")),
    sessionId: res.headers.get("Mcp-Session-Id") || sessionId,
  };
}

async function handshake(url, token) {
  const init = await postMcp(url, token, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "influenceia", version: "1.0" },
    },
  }, null, 30000);
  await postMcp(url, token, { jsonrpc: "2.0", method: "notifications/initialized" }, init.sessionId, 10000).catch(() => {});
  return init.sessionId;
}

function lastResult(messages, id) {
  const msg = messages.find((m) => m.id === id) || messages[messages.length - 1];
  if (msg && msg.error) throw new Error(msg.error.message || "Erreur du serveur MCP Higgsfield");
  return msg ? msg.result : null;
}

export async function listTools(token) {
  const url = getMcpUrl();
  const sessionId = await handshake(url, token);
  const res = await postMcp(url, token, { jsonrpc: "2.0", id: 2, method: "tools/list" }, sessionId, 30000);
  const result = lastResult(res.messages, 2);
  return (result && result.tools) || [];
}

export async function callTool(token, name, args) {
  const url = getMcpUrl();
  const sessionId = await handshake(url, token);
  const res = await postMcp(url, token, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name, arguments: args || {} },
  }, sessionId, 180000);
  return lastResult(res.messages, 2);
}