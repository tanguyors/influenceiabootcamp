import { secrets } from "base44:runtime";

const DEFAULT_URL = "https://mcp.higgsfield.ai/mcp";

export function getConfig() {
  const url = (secrets.get("HIGGSFIELD_MCP_URL") || DEFAULT_URL).replace(/\/$/, "");
  const apiKey = secrets.get("HIGGSFIELD_API_KEY") || "";
  return { url, apiKey };
}

export function isConfigured() {
  return !!secrets.get("HIGGSFIELD_API_KEY");
}

function parseBody(text, contentType) {
  if (!text) return [];
  if (contentType && contentType.includes("text/event-stream")) {
    const messages = [];
    for (const line of text.split("\n")) {
      const m = line.match(/^data:\s*(.*)$/);
      if (m && m[1].trim()) {
        try { messages.push(JSON.parse(m[1])); } catch {}
      }
    }
    return messages;
  }
  try { return [JSON.parse(text)]; } catch { return []; }
}

async function post(url, apiKey, body, sessionId, timeoutMs) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs || 60000),
  });
  const text = await res.text();
  const newSession = res.headers.get("Mcp-Session-Id") || sessionId;
  if (!res.ok && !text) {
    throw new Error(`MCP HTTP ${res.status}`);
  }
  const messages = parseBody(text, res.headers.get("content-type"));
  return { messages, sessionId: newSession, status: res.status, raw: text };
}

async function handshake(url, apiKey) {
  const init = await post(url, apiKey, {
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "influenceia", version: "1.0" },
    },
  }, null, 30000);
  const sid = init.sessionId;
  // notify initialized (no response expected)
  await post(url, apiKey, { jsonrpc: "2.0", method: "notifications/initialized" }, sid, 10000).catch(() => {});
  return sid;
}

function lastResult(messages, id) {
  const msg = messages.find((m) => m.id === id) || messages[messages.length - 1];
  if (msg && msg.error) throw new Error(msg.error.message || "Erreur MCP");
  return msg ? msg.result : null;
}

export async function listTools() {
  const { url, apiKey } = getConfig();
  const sid = await handshake(url, apiKey);
  const res = await post(url, apiKey, { jsonrpc: "2.0", id: 2, method: "tools/list" }, sid, 30000);
  const result = lastResult(res.messages, 2);
  return (result && result.tools) || [];
}

export async function callTool(name, args) {
  const { url, apiKey } = getConfig();
  const sid = await handshake(url, apiKey);
  const res = await post(url, apiKey, {
    jsonrpc: "2.0", id: 2, method: "tools/call",
    params: { name, arguments: args || {} },
  }, sid, 120000);
  return lastResult(res.messages, 2);
}