import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, callTool } from "../../shared/higgsfield.ts";
import { resultText, collectStrings, readJobId } from "../../shared/mcp.ts";

const IMAGE_RE = /https?:\/\/[^\s"'<>\\)]+\.(png|jpe?g|webp)(\?[^\s"'<>\\)]*)?/i;
const SHEET_LIMIT = 6;

function sc(res: any) {
  return (res && res.structuredContent) || {};
}

// URLs des planches générées (on ne retient que des images).
function imagesFrom(res: any): string[] {
  const urls = collectStrings(res)
    .map((s) => s.match(IMAGE_RE))
    .filter(Boolean)
    .map((m: any) => m[0]);
  return Array.from(new Set(urls));
}

function mapStatus(raw: any) {
  const s = String(raw || "").toLowerCase();
  if (["completed", "complete", "succeeded", "success", "ready", "done", "finished"].includes(s)) return "ready";
  if (["failed", "error", "canceled", "cancelled", "rejected", "moderated"].includes(s)) return "failed";
  return s ? "processing" : "";
}

function readSheet(res: any) {
  const data = sc(res);
  const layers = [data, data.generation, data.job, data.result, data.data].filter((l) => l && typeof l === "object");
  let status = "";
  let error = "";
  for (const layer of layers) {
    if (!status) status = layer.status || layer.job_status || layer.state || "";
    if (!error) error = layer.error || layer.error_message || layer.failure_reason || "";
  }
  const text = resultText(res);
  const mapped = mapStatus(status);
  return {
    status: mapped,
    jobId: readJobId(res),
    error: (res && res.isError ? text || "Refusé par Higgsfield" : String(error || "")).slice(0, 400),
    images: mapped === "failed" ? [] : imagesFrom(res),
    detail: text.slice(0, 300),
  };
}

// Traits réellement exploitables pour le niveau demandé (on écarte les traits du niveau « freak »).
function normalizeOptions(data: any, tier: string) {
  const groups = (data.groups || [])
    .filter((g: any) => g && g.id && !String(g.id).startsWith("freak"))
    .map((g: any) => ({
      id: g.id,
      label: g.label || g.id,
      max: Math.min(Math.max(Number(g.max) || 1, 1), 4),
      options: (g.options || [])
        .filter((o: any) => o && o.id && (!o.tiers || o.tiers.includes(tier)))
        .map((o: any) => ({ id: o.id, label: o.label || o.id })),
    }))
    .filter((g: any) => g.options.length > 0);
  return { groups };
}

// Réglages envoyés à Higgsfield : uniquement des choix explicites de l'utilisateur.
function prepareArgs(body: any) {
  const args: any = {
    tier: body.tier || "normal",
    batch_size: Math.min(Math.max(Number(body.batch_size) || 1, 1), 4),
  };
  if (body.brief) args.brief = String(body.brief).slice(0, 4000);
  if (body.selection && Object.keys(body.selection).length) args.selection = body.selection;
  if (typeof body.randomize === "boolean") args.randomize = body.randomize;
  return args;
}

// Copie les planches générées dans le stockage privé de l'app : les influenceurs
// n'utilisent que des fichiers privés (rendus par URL signée).
async function storeImages(base44: any, urls: string[]) {
  const stored: string[] = [];
  for (const url of urls.slice(0, SHEET_LIMIT)) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const type = res.headers.get("content-type") || "image/png";
      if (!type.startsWith("image/")) continue;
      const buffer = await res.arrayBuffer();
      if (!buffer.byteLength || buffer.byteLength > 12000000) continue;
      const ext = ((url.match(IMAGE_RE) || [])[1] || "png").toLowerCase();
      const file = new File([buffer], `influenceur-${stored.length + 1}.${ext}`, { type });
      const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
      if (upload && upload.file_uri) stored.push(upload.file_uri);
    } catch {
      /* on garde les autres planches */
    }
  }
  return stored;
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "options";

    const token = await getAccessToken(base44, user.id);
    if (!token) {
      return Response.json({
        error: "Compte Higgsfield non connecté. Connectez-le depuis la page Connexion Higgsfield.",
      }, { status: 400 });
    }

    // Traits proposés par Higgsfield pour construire le personnage.
    if (action === "options") {
      const tier = body.tier || "normal";
      const res = await callTool(token, "ai_influencer_get_options", { tier });
      return Response.json({ tier, ...normalizeOptions(sc(res), tier) });
    }

    // Devis : Higgsfield compose le personnage et chiffre la génération sans rien dépenser.
    // Les réglages renvoyés sont ceux à transmettre tels quels à la génération.
    if (action === "quote") {
      const res = await callTool(token, "ai_influencer_prepare", prepareArgs(body));
      const data = sc(res);
      const params = data.params || data.settings || null;
      if (!params) {
        return Response.json({ error: "Higgsfield n'a pas renvoyé de réglages exploitables.", detail: resultText(res).slice(0, 300) }, { status: 502 });
      }
      return Response.json({
        params,
        credits: Number(data.credits || data.total_credits || 0),
      });
    }

    // Lancement de la génération à partir des réglages validés par l'utilisateur.
    if (action === "start") {
      if (!body.params) return Response.json({ error: "Réglages manquants : préparez d'abord le personnage." }, { status: 400 });
      const result = await callTool(token, "ai_influencer_generate", {
        params: body.params,
        ...(Number(body.max_credits) > 0 ? { max_credits: Number(body.max_credits) } : {}),
      });
      const sheet = readSheet(result);
      if (sheet.error) return Response.json({ error: sheet.error }, { status: 400 });
      if (!sheet.jobId && !sheet.images.length) {
        return Response.json({ error: "Higgsfield n'a renvoyé aucune tâche à suivre.", detail: sheet.detail }, { status: 502 });
      }
      return Response.json({
        job_id: sheet.jobId,
        status: sheet.images.length ? "ready" : "processing",
        images: await storeImages(base44, sheet.images),
      });
    }

    // Suivi : à la fin, les planches sont copiées dans le stockage privé de l'app.
    if (action === "status") {
      if (!body.job_id) return Response.json({ error: "job_id requis" }, { status: 400 });
      let sheet = readSheet(await callTool(token, "job_status", { jobId: body.job_id }));
      if (!sheet.images.length && sheet.status !== "failed") {
        try {
          const direct = readSheet(await callTool(token, "show_generation_by_ids", { ids: [body.job_id] }));
          if (direct.images.length) sheet = { ...direct, status: "ready" };
        } catch { /* le statut de la tâche reste la source principale */ }
      }
      if (sheet.error) return Response.json({ status: "failed", error: sheet.error });
      if (sheet.images.length) {
        return Response.json({ status: "ready", images: await storeImages(base44, sheet.images) });
      }
      return Response.json({ status: sheet.status || "processing" });
    }

    return Response.json({ error: `Action inconnue : ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}