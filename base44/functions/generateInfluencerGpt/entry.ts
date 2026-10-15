import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from "base44:runtime";

const MODEL = "gpt-image-1";
const MAX_SHEETS = 4;
const OPTION_COUNT = 9;

// Les 9 vues de la planche de référence (grille 3x3, du visage au plan large).
const VIEWS = [
  "très gros plan du visage de face, cadrage serré sur les yeux et la bouche",
  "visage de trois-quarts gauche",
  "visage de trois-quarts droit",
  "profil gauche complet",
  "profil droit complet",
  "vue de dos",
  "plan poitrine de face, grand sourire montrant les dents",
  "plan américain",
  "plan pied entier de face",
];

// Étape 1 : neuf interprétations du personnage décrit, une par image, pour laisser le choix.
// Rendu exigé sur toutes les images : sans ces consignes, le moteur lisse la peau et livre un
// visage de synthèse, sans pores ni aspérités.
const REALISM = [
  "Rendu photographique de très haute fidélité, peau réelle et jamais lissée.",
  "Grain de peau visible partout (pores, duvet, rides fines, taches, rougeurs légères, éventuelles cicatrices), aspérités et irrégularités naturelles, léger brillant du naturel, asymétrie discrète du visage.",
  "Aucune retouche beauté : ni peau de porcelaine, ni lissage, ni flou artistique, ni effet plastique, ni rendu 3D ou illustration, ni aspect « image générée par IA ».",
  "Les traits de signature gardent un aspect naturel : un regard coloré reste un vrai iris photographié (fibres, reflets, cils), jamais un œil qui brille ou une couleur d'effet spécial, et aucun trait n'est maquillé, idéalisé ou embelli.",
  "Photo de studio : objectif 85 mm, lumière naturelle douce, netteté sur les yeux et la peau, aucune écriture, aucun logo, aucun cadre ni légende.",
];

// Pistes de structure du visage réparties sur les neuf propositions : sans elles, le moteur
// décline neuf fois le même visage et le choix devient impossible.
const VARIATION_AXES = [
  "visage anguleux, pommettes hautes, sourcils fins",
  "visage rond, joues pleines, mâchoire large",
  "front haut, sourcils épais, nez droit",
  "traits fins et longs, lèvres minces, menton discret",
  "joues hautes, nez court, menton large",
  "pommettes marquées, nez aquilin, regard profond",
  "visage allongé, menton saillant, arcades marquées",
  "traits doux, yeux légèrement tombants, bouche pleine",
  "traits massifs, cou épais, arcade sourcilière lourde",
];

// Une seule identité et une seule photographie par appel : aucune instruction de série
// dans le prompt, sinon le moteur dessine la série entière à l'intérieur de chaque image.
function optionsPrompt(brief, details, variant) {
  const backgrounds = ["gris clair", "beige clair", "blanc cassé", "bleu très pâle"];
  return [
    "EXACTLY ONE PHOTOGRAPH OF ONE PERSON. One uninterrupted photographic scene, one head and one body. No collage, no grid, no contact sheet, no character sheet, no panels, no montage, no inset photographs, no multiple views, no other people, no reflections of people.",
    `Attributs du personnage à respecter : ${brief}`,
    details.length
      ? `Mandatory signature features, rendered exactly and unmistakably on this single person: ${details.join("; ")}. Never idealise, beautify, soften or omit them.`
      : "",
    `Direction de structure faciale pour cette personne uniquement : ${VARIATION_AXES[variant]}. Elle s'applique seulement aux caractéristiques non définies par les choix utilisateur. Les attributs choisis et les traits interdits ont toujours priorité : ne modifiez jamais l'âge, le genre, l'origine, la morphologie, les yeux, les cheveux, la pilosité ou un autre trait explicitement fixé.`,
    "Créez une identité individuelle originale, sans copier de célébrité. Conservez une texture de peau réaliste et une expression naturelle, sans caricature.",
    `Une seule personne de face, regard vers l'objectif, tête entière avec marge au-dessus, épaules et torse bien visibles jusqu'au bas de la poitrine. Une seule tenue dans le style choisi, un seul fond uni ${backgrounds[variant % backgrounds.length]}.`,
    REALISM.join(" "),
    "Livrez une photographie unique de cette seule personne, jamais une planche de propositions. N'ajoutez aucun détail, bijou, marque ou trait exclu du brief.",
  ].filter(Boolean).join("\n\n");
}

// Étape 2 : la planche définitive, composée à partir du personnage retenu qui sert de modèle.
// Sans l'insistance sur les détails fins (dents du bonheur, paupières lourdes, grill…), le
// moteur lisse le visage et laisse tomber la signature du personnage.
function sheetPrompt(brief: string, details: string[]) {
  return [
    "Conservez exactement le visage, la coiffure et la morphologie du personnage de l'image de référence : la même personne, au détail près.",
    `Planche de référence de personnage (character sheet) : une seule image composée d'une grille de 3 lignes sur 3 colonnes, 9 cases de taille égale, chacune montrant ce personnage sous un angle différent : ${VIEWS.join(", ")}.`,
    `Personnage : ${brief}`,
    details.length
      ? `Signature features of this person, to render exactly and unmistakably in every view where they can be seen: ${details.join("; ")}. These features are the point of the character: never idealise, beautify, soften or omit them, and never replace the face with a generic attractive person.`
      : "",
    "Identité strictement identique dans les 9 cases (même visage, mêmes cheveux, même tenue, même morphologie), mêmes traits du visage au détail près (mêmes yeux, mêmes sourcils, mêmes lèvres, mêmes dents), même lumière naturelle et même fond uni gris clair partout, espacement régulier entre les cases.",
    REALISM.join(" "),
    "Le personnage correspond exactement à la description et aux traits de signature listés : n'inventez aucun détail, bijou, marque ou trait qui n'y figure pas.",
  ].filter(Boolean).join("\n\n");
}

// Les images reviennent en base64 : on les dépose dans le stockage privé par lots de six.
async function storeImages(base44: any, payload: any) {
  const parts: string[] = (payload?.data || [])
    .map((item: any) => (item && item.b64_json) || "")
    .filter(Boolean);
  const images: string[] = [];
  for (let start = 0; start < parts.length; start += 6) {
    const batch = await Promise.allSettled(
      parts.slice(start, start + 6).map(async (b64, offset) => {
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const file = new File([bytes], `influenceur-openai-${start + offset + 1}.png`, { type: "image/png" });
        const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
        return upload && upload.file_uri ? upload.file_uri : "";
      })
    );
    for (const result of batch) {
      if (result.status === "fulfilled" && result.value) images.push(result.value);
    }
  }
  return images;
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "sheet" ? "sheet" : "options";
    const brief = String(body.brief || "").trim().slice(0, 6000);
    if (brief.length < 3) {
      return Response.json({ error: "Décrivez le personnage avant de générer." }, { status: 400 });
    }

    // Traits de signature déjà traduits en anglais par le funnel (liste courte, bornée).
    const details = (Array.isArray(body.details) ? body.details : [])
      .map((item: any) => String(item || "").trim().slice(0, 180))
      .filter(Boolean)
      .slice(0, 24);

    const key = secrets.get("OPENAI_API_KEY");
    if (!key) {
      return Response.json({ error: "Clé OpenAI manquante : ajoutez le secret OPENAI_API_KEY." }, { status: 400 });
    }

    let res: Response;
    if (mode === "sheet") {
      const reference = String(body.reference_image || "").trim();
      if (!reference) {
        return Response.json({ error: "Choisissez d'abord un des personnages proposés." }, { status: 400 });
      }
      const count = Math.min(Math.max(Number(body.count) || 1, 1), MAX_SHEETS);

      // Le personnage retenu est relu depuis le stockage privé puis envoyé comme référence :
      // c'est ce qui garantit la fidélité du visage sur la planche.
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: reference,
        expires_in: 600,
      });
      const fileRes = await fetch(signed.signed_url, { signal: AbortSignal.timeout(60000) });
      if (!fileRes.ok) {
        return Response.json({ error: "Personnage de référence introuvable : relancez la génération." }, { status: 400 });
      }
      const bytes = new Uint8Array(await fileRes.arrayBuffer());

      const form = new FormData();
      form.append("model", MODEL);
      form.append("image", new Blob([bytes], { type: "image/png" }), "reference.png");
      form.append("prompt", sheetPrompt(brief, details));
      form.append("n", String(count));
      form.append("size", "1024x1536");
      form.append("quality", "medium");

      res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
        signal: AbortSignal.timeout(240000),
      });
    } else {
      const variant = body.variant === undefined ? 0 : body.variant;
      if (!Number.isInteger(variant) || variant < 0 || variant >= OPTION_COUNT) {
        return Response.json({ error: "Proposition de personnage invalide." }, { status: 400 });
      }
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: MODEL,
          prompt: optionsPrompt(brief, details, variant),
          n: 1,
          size: "1024x1024",
          quality: "medium",
        }),
        signal: AbortSignal.timeout(280000),
      });
    }

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
    const images = await storeImages(base44, payload);
    if (!images.length) return Response.json({ error: "OpenAI n'a renvoyé aucune image." }, { status: 502 });
    return Response.json({ images });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}