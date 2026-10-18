import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

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
  "Les traits de signature gardent un aspect naturel : un regard coloré reste un vrai iris photographié (fibres, reflets, cils), jamais un œil qui brille ou une couleur d'effet spécial.",
  "Photo de studio : objectif 85 mm, lumière naturelle douce, netteté sur les yeux et la peau, aucune écriture, aucun logo, aucun cadre ni légende.",
];

// Les neuf propositions se répartissent en trois familles de trois, dans cet ordre : trois fidèles
// au brief, trois version glamour, trois version déjantée. Elles changent la mise en scène, jamais
// les choix du parcours : le brief reste prioritaire dans les trois familles.
const VARIATION_STYLES = [
  {
    label: "Fidèle au brief",
    look: "structure faciale neutre : visage ovale, pommettes moyennes, mâchoire douce",
    tone: "Rendez ce personnage exactement tel que décrit, sans l'embellir ni l'exagérer : un être humain ordinaire et crédible.",
    background: "gris clair",
  },
  {
    label: "Fidèle au brief",
    look: "structure faciale neutre : visage légèrement rond, joues pleines, mâchoire large",
    tone: "Rendez ce personnage exactement tel que décrit, sans l'embellir ni l'exagérer : un être humain ordinaire et crédible.",
    background: "gris clair",
  },
  {
    label: "Fidèle au brief",
    look: "structure faciale neutre : front haut, sourcils d'épaisseur moyenne, nez droit",
    tone: "Rendez ce personnage exactement tel que décrit, sans l'embellir ni l'exagérer : un être humain ordinaire et crédible.",
    background: "gris clair",
  },
  {
    label: "Glam",
    look: "version glamour assumée : pommettes hautes sculptées, mâchoire nette, regard magnétique, pose de mannequin, lumière flatteuse de studio de mode",
    tone: "Assumez franchement cette version embellie : elle est voulue. La personne reste réelle, jamais un masque de synthèse, avec sa texture de peau et ses aspérités.",
    background: "beige clair",
  },
  {
    label: "Glam",
    look: "version glamour assumée : beauté solaire irréprochable, sourire éclatant, cou long, finition de magazine de mode",
    tone: "Assumez franchement cette version embellie : elle est voulue. La personne reste réelle, jamais un masque de synthèse, avec sa texture de peau et ses aspérités.",
    background: "beige clair",
  },
  {
    label: "Glam",
    look: "version glamour assumée : traits fins et réguliers, lèvres bien dessinées, sourcils nets, allure haute couture",
    tone: "Assumez franchement cette version embellie : elle est voulue. La personne reste réelle, jamais un masque de synthèse, avec sa texture de peau et ses aspérités.",
    background: "beige clair",
  },
  {
    label: "Déjanté",
    look: "version déjantée assumée : coiffure démesurée, expression théâtrale, tenue improbable et accessoires extravagants",
    tone: "Assumez franchement cette version loufoque : l'exagération, l'humour et les détails too much sont voulus. Le visage reste photographique et crédible, jamais difforme ni monstrueux.",
    background: "bleu très pâle",
  },
  {
    label: "Déjanté",
    look: "version déjantée assumée : couleurs criardes, grimace joyeuse, pose absurde, énergie de clown de mode",
    tone: "Assumez franchement cette version loufoque : l'exagération, l'humour et les détails too much sont voulus. Le visage reste photographique et crédible, jamais difforme ni monstrueux.",
    background: "bleu très pâle",
  },
  {
    label: "Déjanté",
    look: "version déjantée assumée : style punk-fantaisie, détails volontairement exagérés, regard intense, silhouette improbable",
    tone: "Assumez franchement cette version loufoque : l'exagération, l'humour et les détails too much sont voulus. Le visage reste photographique et crédible, jamais difforme ni monstrueux.",
    background: "bleu très pâle",
  },
];

// Une seule identité et une seule photographie par appel : aucune instruction de série
// dans le prompt, sinon le moteur dessine la série entière à l'intérieur de chaque image.
function optionsPrompt(brief, details, variant) {
  const style = VARIATION_STYLES[variant];
  return [
    "EXACTLY ONE PHOTOGRAPH OF ONE PERSON. One uninterrupted photographic scene, one head and one body. No collage, no grid, no contact sheet, no character sheet, no panels, no montage, no inset photographs, no multiple views, no other people, no reflections of people.",
    `Attributs du personnage à respecter : ${brief}`,
    details.length
      ? `Mandatory signature features, rendered exactly and unmistakably on this single person: ${details.join("; ")}. Never soften or omit them, and never replace them with a different feature.`
      : "",
    `Famille de cette proposition : « ${style.label} ». ${style.look}.`,
    `Le brief reste prioritaire sur cette direction : l'âge, le genre, l'origine, la morphologie, les yeux, les cheveux, la pilosité et tout trait explicitement fixé sont conservés à l'identique.`,
    style.tone,
    "Identité originale, sans copier de célébrité.",
    `Une seule personne de face, regard vers l'objectif, tête entière avec marge au-dessus, épaules et torse bien visibles jusqu'au bas de la poitrine. Une seule tenue cohérente avec la famille de la proposition, un seul fond uni ${style.background}.`,
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

// L'IA de la plateforme renvoie une URL : on recopie l'image dans le stockage privé du personnage,
// parce que les références d'un influenceur ne doivent jamais être exposées publiquement.
async function storeGenerated(base44: any, urls: string[], prefix: string) {
  const images: string[] = [];
  for (const [index, url] of urls.entries()) {
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) continue;
    const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
    const extension = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
    const bytes = new Uint8Array(await response.arrayBuffer());
    const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
      file: new File([bytes], `${prefix}-${index + 1}.${extension}`, { type: mime }),
    });
    if (upload && upload.file_uri) images.push(upload.file_uri);
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

    const ai = base44.asServiceRole.integrations.Core;

    if (mode === "sheet") {
      const reference = String(body.reference_image || "").trim();
      if (!reference) {
        return Response.json({ error: "Choisissez d'abord un des personnages proposés." }, { status: 400 });
      }
      const count = Math.min(Math.max(Number(body.count) || 1, 1), MAX_SHEETS);

      // Le personnage retenu est relu depuis le stockage privé puis envoyé comme référence :
      // c'est ce qui garantit la fidélité du visage sur la planche.
      const signed = await ai.CreateFileSignedUrl({ file_uri: reference, expires_in: 600 });
      const prompt = sheetPrompt(brief, details);
      const sheets: string[] = [];
      for (let index = 0; index < count; index++) {
        const { url } = await ai.GenerateImage({ prompt, existing_image_urls: [signed.signed_url] });
        sheets.push(...(await storeGenerated(base44, [url], `planche-${index + 1}`)));
      }
      if (!sheets.length) return Response.json({ error: "L'IA n'a renvoyé aucune planche : relancez." }, { status: 502 });
      return Response.json({ images: sheets });
    }

    const variant = body.variant === undefined ? 0 : body.variant;
    if (!Number.isInteger(variant) || variant < 0 || variant >= OPTION_COUNT) {
      return Response.json({ error: "Proposition de personnage invalide." }, { status: 400 });
    }

    // Famille de la proposition, renvoyée pour l'étiquette affichée sous le portrait.
    const styleLabel = VARIATION_STYLES[variant].label;
    const option = await ai.GenerateImage({ prompt: optionsPrompt(brief, details, variant) });
    const portraits = await storeGenerated(base44, [option.url], "portrait");
    if (!portraits.length) return Response.json({ error: "L'IA n'a renvoyé aucun portrait : relancez." }, { status: 502 });
    return Response.json({ images: portraits, style: styleLabel });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}