import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAccessToken, listTools, callTool } from "../../shared/higgsfield.ts";

// Sonde temporaire : lecture seule des schémas d'outils Higgsfield.
export default async function(req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });
  const token = await getAccessToken(base44);
  if (!token) return Response.json({ error: "non connecté" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  if (body.kind === "schemas") {
    const tools = await listTools(token);
    const out = {};
    for (const name of body.names || []) {
      const t = tools.find((x) => x.name === name);
      out[name] = t ? JSON.stringify(t.inputSchema).slice(0, Number(body.max) || 900) : "absent";
    }
    return Response.json(out);
  }

  if (body.kind === "models") {
    const res = await callTool(token, "models_explore", { action: "list", type: "video", limit: 60 });
    const items = ((res && res.structuredContent) || {}).items || [];
    return Response.json({
      count: items.length,
      models: items.filter((m) => (body.roles || ["video"]).every((r) => (m.medias || []).some((x) => (x.roles || []).includes(r)))).map((m) => ({
        id: m.id,
        name: m.name,
        roles: Array.from(new Set((m.medias || []).flatMap((x) => x.roles || []))),
        durations: m.durations || m.duration_range || null,
      })),
    });
  }

  if (body.kind === "wftext") {
    const res = await callTool(token, "get_workflow_instructions", body.args || {});
    const text = ((res && res.content) || []).map((c) => c.text || "").join("\n");
    const from = Number(body.from) || 0;
    return Response.json({ length: text.length, slice: text.slice(from, from + (Number(body.len) || 3000)) });
  }

  if (body.kind === "bundle") {
    const res = await callTool(token, "get_workflow_bundle_file", body.args || {});
    const text = ((res && res.content) || []).map((c) => c.text || "").join("\n");
    return Response.json({ length: text.length, text: text.slice(0, Number(body.max) || 4000) });
  }

  if (body.kind === "workflows") {
    const res = await callTool(token, "get_workflow_instructions", {});
    const text = ((res && res.content) || []).map((c) => c.text || "").join("\n");
    const re = new RegExp(body.filter || "replace|character|motion|framing|recreate", "i");
    const lines = text.split("\n").filter((l) => re.test(l));
    return Response.json({ total: text.length, kept: lines.length, lines: lines.map((l) => l.slice(0, 700)) });
  }

  if (body.kind === "slice") {
    const tools = await listTools(token);
    const t = tools.find((x) => x.name === body.name);
    const json = JSON.stringify(t.inputSchema);
    const at = json.indexOf(body.find);
    return Response.json({ at, slice: at < 0 ? "absent" : json.slice(at, at + (Number(body.len) || 1600)) });
  }

  if (body.kind === "model") {
    const res = await callTool(token, "models_explore", { action: "list", type: "video", limit: 60 });
    const items = ((res && res.structuredContent) || {}).items || [];
    const m = items.find((x) => x.id === body.id);
    return Response.json({ json: m ? JSON.stringify(m).slice(0, Number(body.max) || 3500) : "absent" });
  }

  if (body.kind === "call") {
    const res = await callTool(token, body.name, body.args || {});
    return Response.json({ text: JSON.stringify(res).slice(0, Number(body.max) || 1500) });
  }

  return Response.json({ error: "kind inconnu" });
}