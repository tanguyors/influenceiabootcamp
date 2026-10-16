import { callTool } from "./higgsfield.ts";

// Genjutsu remplace un sujet dans le plan source, sans reconstruire un plan solo.
export const replacementModelId = "hf_mult_replace_object";

export function characterPhotos(influencer) {
  return [...new Set([
    influencer.face_reference_image,
    influencer.reference_image,
    ...(Array.isArray(influencer.reference_images) ? influencer.reference_images : []),
  ].filter(Boolean))].slice(0, 8);
}

export function replacementParams(prompt, imageIds, videoId, resolution) {
  if (!imageIds.length || !videoId) throw new Error("Photos du personnage et vidéo source requises.");
  return {
    model: replacementModelId,
    prompt,
    resolution: resolution === "720p" ? "720p" : "1080p",
    medias: [
      ...imageIds.map((value) => ({ value, role: "image" })),
      { value: videoId, role: "video" },
    ],
  };
}

// Un preset décoratif n'est jamais le but de cette opération. Cette réponse ne
// soumet aucune tâche : refuser la suggestion puis soumettre la même opération.
export async function requestVideo(token, params) {
  const result = await callTool(token, "generate_video", { params });
  const notice = result?.structuredContent?.notice;
  const declinedId = notice?.data?.retry_literal_with?.declined_preset_id;
  if (notice?.type === "preset_recommendation" && declinedId) {
    return await callTool(token, "generate_video", { params: { ...params, declined_preset_id: declinedId } });
  }
  return result;
}

// Ne jamais confondre une vidéo d'entrée avec le résultat, même si le texte MCP
// contient l'intégralité des paramètres d'entrée avant l'URL de sortie.
export function outputVideoUrl(response) {
  const visit = (node) => {
    if (!node || typeof node !== "object") return "";
    if (Array.isArray(node)) return node.map(visit).find(Boolean) || "";
    for (const key of ["rawUrl", "video_url", "videoUrl", "output_url", "result_video_url", "url"]) {
      if (typeof node[key] === "string" && /^https:\/\/[^\s]+\.(mp4|mov|webm)(\?[^\s]*)?$/i.test(node[key])) return node[key];
    }
    for (const key of ["results", "result", "outputs", "output", "generation", "generations", "job", "data"]) {
      const url = visit(node[key]);
      if (url) return url;
    }
    return "";
  };
  const structured = visit(response?.structuredContent);
  if (structured) return structured;
  for (const item of response?.content || []) {
    if (item.type !== "text") continue;
    try { const url = visit(JSON.parse(item.text)); if (url) return url; } catch { /* Un texte libre n'est pas une sortie vidéo vérifiée. */ }
  }
  return "";
}