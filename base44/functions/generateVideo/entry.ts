import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isConfigured, listTools, callTool } from "../../shared/higgsfield.ts";

// Pick the most likely video-generation tool from discovered MCP tools.
function pickVideoTool(tools) {
  if (!tools || !tools.length) return null;
  const score = (t) => {
    const s = `${t.name} ${t.description || ""}`.toLowerCase();
    let n = 0;
    if (/video/.test(s)) n += 5;
    if (/generat|create|make/.test(s)) n += 2;
    if (/soul|kling|veo|seedance|minimax|wan/.test(s)) n += 2;
    if (/image|photo/.test(s) && !/video/.test(s)) n -= 3;
    return n;
  };
  const sorted = [...tools].sort((a, b) => score(b) - score(a));
  return sorted[0];
}

// Build tool arguments from a best-guess schema; extra keys are tolerated by most servers.
function buildArgs(tool, ctx) {
  const args = { prompt: ctx.prompt };
  if (ctx.imageUrl) {
    args.image = ctx.imageUrl;
    args.image_url = ctx.imageUrl;
    args.reference_image = ctx.imageUrl;
  }
  if (ctx.duration) args.duration = ctx.duration;
  if (ctx.aspectRatio) args.aspect_ratio = ctx.aspectRatio;
  if (ctx.resolution) args.resolution = ctx.resolution;
  if (ctx.model && ctx.model !== "auto") args.model = ctx.model;
  return args;
}

// Extract a video URL, job id, cost from an MCP tool result.
function parseResult(result) {
  const out = { status: "processing", videoUrl: "", jobId: "", cost: "", upscaled: false, error: "" };
  if (!result) return out;
  let text = "";
  if (typeof result === "string") text = result;
  else if (result.content && Array.isArray(result.content)) {
    text = result.content.map((c) => (c.type === "text" ? c.text : "")).join(" ");
  } else if (result.text) {
    text = result.text;
  }
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+\.(mp4|mov|webm|gif|png|jpg|jpeg|webp)[^\s"'<>]*/i);
  if (urlMatch) out.videoUrl = urlMatch[0];
  // try JSON inside text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]);
      out.videoUrl = out.videoUrl || obj.video_url || obj.url || obj.output_url || obj.result_url || "";
      out.jobId = obj.job_id || obj.id || obj.task_id || obj.request_id || "";
      out.cost = obj.cost != null ? String(obj.cost) : (obj.credits != null ? String(obj.credits) : "");
      if (obj.upscaled === true || obj.is_upscaled === true) out.upscaled = true;
    } catch {}
  }
  const idMatch = !out.jobId && text.match(/\b(job|task|request|generation)[_\- ]?id[:\s]+([a-zA-Z0-9_-]+)/i);
  if (idMatch) out.jobId = idMatch[2];
  if (out.videoUrl) out.status = "ready";
  else if (result.isError) {
    out.status = "failed";
    out.error = text.slice(0, 500);
  }
  return out;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { influencer_id, viral_video_id, model, duration, aspect_ratio, resolution, wardrobe, setting, instructions } = body;
    if (!influencer_id) return Response.json({ error: "influencer_id requis" }, { status: 400 });

    if (!isConfigured()) {
      return Response.json({ error: "Clé API Higgsfield non configurée. Ajoutez HIGGSFIELD_API_KEY dans la page Secrets de l'application." }, { status: 400 });
    }

    // Load influencer + reference
    const infPage = await base44.entities.Influencer.filter({ id: influencer_id }, { limit: 1 });
    const influencer = (infPage.items || [])[0];
    if (!influencer) return Response.json({ error: "Influenceur introuvable" }, { status: 404 });

    let viralVideo = null;
    if (viral_video_id) {
      const vp = await base44.entities.ViralVideo.filter({ id: viral_video_id }, { limit: 1 });
      viralVideo = (vp.items || [])[0];
    }

    // Signed URL for the influencer image (Higgsfield needs a fetchable URL)
    let imageUrl = "";
    if (influencer.reference_image) {
      try {
        const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: influencer.reference_image, expires_in: 7200,
        });
        imageUrl = signed_url;
      } catch (e) { /* continue without image */ }
    }

    // Build prompt
    const parts = [];
    if (viralVideo) parts.push(`Reprendre la direction visuelle (cadrage, mise en scène, rythme) de la vidéo de référence « ${viralVideo.title} » (${viralVideo.platform}, ${viralVideo.category}).`);
    parts.push(`Personnage principal : ${influencer.name}, conserver son visage et son apparence.`);
    if (wardrobe) parts.push(`Tenue : ${wardrobe}.`);
    if (setting) parts.push(`Décor : ${setting}.`);
    if (instructions) parts.push(instructions);
    parts.push(`Format ${aspect_ratio || "9:16"}, résolution ${resolution || "1080p"}, durée ${duration || 6} secondes.`);
    const prompt = parts.join(" ");

    // Create a processing record (avoids double launches: user can see it immediately)
    const creation = await base44.entities.Creation.create({
      influencer_id,
      influencer_name: influencer.name,
      viral_video_id: viral_video_id || "",
      viral_video_title: viralVideo ? viralVideo.title : "",
      status: "processing",
      model: model || "auto",
      duration: duration || 6,
      aspect_ratio: aspect_ratio || "9:16",
      resolution: resolution || "1080p",
      prompt,
    });

    // Discover tools and pick a video generation tool
    let tools = [];
    try { tools = await listTools(); } catch (e) { tools = []; }
    const tool = pickVideoTool(tools);
    if (!tool) {
      await base44.entities.Creation.update(creation.id, {
        status: "failed",
        error: "Aucun outil de génération vidéo trouvé dans le MCP Higgsfield. Outils découverts : " + (tools.map((t) => t.name).join(", ") || "aucun"),
      });
      return Response.json({ error: "Aucun outil de génération vidéo trouvé", creation_id: creation.id }, { status: 400 });
    }

    const args = buildArgs(tool, { prompt, imageUrl, model, duration, aspectRatio: aspect_ratio, resolution });

    try {
      const result = await callTool(tool.name, args);
      const parsed = parseResult(result);
      await base44.entities.Creation.update(creation.id, {
        status: parsed.status,
        result_video_url: parsed.videoUrl,
        higgsfield_job_id: parsed.jobId,
        cost: parsed.cost,
        is_upscaled: parsed.upscaled,
        error: parsed.error,
        model: tool.name,
      });
      return Response.json({ creation_id: creation.id, status: parsed.status, tool: tool.name });
    } catch (e) {
      await base44.entities.Creation.update(creation.id, { status: "failed", error: e.message });
      return Response.json({ error: e.message, creation_id: creation.id }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}