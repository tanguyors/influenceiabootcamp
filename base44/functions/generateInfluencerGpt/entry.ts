import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

const MODEL = "gpt-image-1";
const MAX_IMAGES = 4;

// Le brief du funnel décrit déjà le personnage : on y ajoute seulement les
// contraintes de cadrage pour obtenir un portrait exploitable comme influenceur.
function promptFrom(brief: string) {
  return [
    brief,
    "Portrait photo réaliste d'une seule personne, cadrage vertical 9:16, lumière naturelle, rendu authentique de réseaux sociaux, aucun texte ni logo dans l'image.",
  ].filter(Boolean).join("\n\n");
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const brief = String(body.brief || "").trim().slice(0, 4000);
    if (brief.length < 3) {
      return Response.json({ error: "Décrivez le personnage avant de générer." }, { status: 400 });
    }
    const count = Math.min(Math.max(Number(body.count) || 1, 1), MAX_IMAGES);

    const key = secrets.get("OPENAI_API_KEY");
    if (!key) {
      return Response.json({ error: "Clé OpenAI manquante : ajoutez le secret OPENAI_API_KEY." }, { status: 400 });
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        prompt: promptFrom(brief),
        n: count,
        size: "1024x1536",
        quality: "medium",
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const detail = await res.text();
      let message = "";
      try { message = JSON.parse(detail)?.error?.message || ""; } catch { message = detail.slice(0, 200); }
      if (res.status === 401) {
        return Response.json({ error: "Clé OpenAI refusée : vérifiez le secret OPENAI_API_KEY." }, { status: 400 });
      }
      if (res.status === 429) {
        const quota = /quota|billing|credit/i.test(message);
        return Response.json({
          error: quota
            ? "Compte OpenAI sans crédit disponible : ajoutez un moyen de paiement sur platform.openai.com, puis relancez."
            : "Trop de requêtes OpenAI en peu de temps : réessayez dans un instant.",
        }, { status: 400 });
      }
      return Response.json({ error: message || `OpenAI a refusé la génération (${res.status}).` }, { status: 502 });
    }

    const payload = await res.json();
    const images: string[] = [];
    for (const item of (payload.data || [])) {
      if (!item || !item.b64_json) continue;
      const bytes = Uint8Array.from(atob(item.b64_json), (c) => c.charCodeAt(0));
      const file = new File([bytes], `influenceur-openai-${images.length + 1}.png`, { type: "image/png" });
      const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
      if (upload && upload.file_uri) images.push(upload.file_uri);
    }

    if (!images.length) return Response.json({ error: "OpenAI n'a renvoyé aucune image." }, { status: 502 });
    return Response.json({ images });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}