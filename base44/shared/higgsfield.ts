import { secrets } from "base44:runtime";

// API développeur Higgsfield (distincte du MCP, qui exige un client desktop).
const API_BASE = "https://api.higgsfield.ai";

// Moteur utilisé : Genjutsu — transfert de mouvement (le mouvement de la vidéo source
// est conservé, le personnage est remplacé par celui de l'influenceur).
export const MOTION_TRANSFER_ENDPOINT = "higgsfield/genjutsu/motion-transfer/v1.0";
export const ENGINE_LABEL = "Genjutsu — transfert de mouvement";

export function getCredentials() {
  const keyId = secrets.get("HIGGSFIELD_API_KEY_ID") || "";
  const keySecret = secrets.get("HIGGSFIELD_API_KEY_SECRET") || "";
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

function authHeaders(keyId, keySecret) {
  return { Authorization: `Key ${keyId}:${keySecret}` };
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// Vérifie les identifiants sans dépenser de crédits : un identifiant de requête
// inconnu renvoie 401 si les identifiants sont refusés, 404 s'ils sont valides.
export async function checkCredentials() {
  const { keyId, keySecret } = getCredentials();
  const res = await fetch(`${API_BASE}/requests/${crypto.randomUUID()}/status`, {
    headers: authHeaders(keyId, keySecret),
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401) {
    return { ok: false, message: "Identifiants refusés par Higgsfield : vérifiez la clé ID et le secret." };
  }
  if (res.ok || res.status === 404) {
    return { ok: true, message: "Identifiants Higgsfield acceptés." };
  }
  return { ok: false, message: `Réponse inattendue de l'API Higgsfield (HTTP ${res.status}).` };
}

export async function submitMotionTransfer({ videoUrl, imageUrls, prompt, resolution }) {
  const { keyId, keySecret } = getCredentials();
  const payload = { video_url: videoUrl, image_urls: imageUrls };
  if (prompt) payload.prompt = prompt;
  if (resolution) payload.resolution = resolution;

  const res = await fetch(`${API_BASE}/${MOTION_TRANSFER_ENDPOINT}`, {
    method: "POST",
    headers: {
      ...authHeaders(keyId, keySecret),
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.detail || `Higgsfield a refusé la requête (HTTP ${res.status}).`);
  return data;
}

export async function getRequestStatus(requestId) {
  const { keyId, keySecret } = getCredentials();
  const res = await fetch(`${API_BASE}/requests/${requestId}/status`, {
    headers: authHeaders(keyId, keySecret),
    signal: AbortSignal.timeout(20000),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data.detail || `Higgsfield HTTP ${res.status}`);
  return data;
}

// Traduit l'état Higgsfield vers les statuts de l'application.
export function mapRequestState(request) {
  const state = request ? request.status : "";
  if (state === "completed") {
    return { status: "ready", videoUrl: (request.video && request.video.url) || "", error: "" };
  }
  if (state === "failed") {
    return { status: "failed", videoUrl: "", error: request.error || "La génération a échoué." };
  }
  if (state === "nsfw") {
    return { status: "failed", videoUrl: "", error: "Contenu rejeté par la modération de Higgsfield." };
  }
  if (state === "canceled") {
    return { status: "failed", videoUrl: "", error: "Requête annulée avant traitement." };
  }
  if (state === "in_progress") {
    return { status: "processing", videoUrl: "", error: "" };
  }
  return { status: "pending", videoUrl: "", error: "" };
}