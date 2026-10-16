import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Import d'un personnage réservé sur la banque de caractères, à partir du lien personnel
// copié par le participant. Appel serveur à serveur, sans clé partagée ni secret.
//
// Le lien et son token ne sont jamais journalisés, jamais renvoyés et jamais conservés :
// seule la fiche du personnage est enregistrée dans cette copie de l'application.

const BANK_HOST = "characters.cashfluenceur.com";
const BANK_IMPORT_URL = `https://${BANK_HOST}/api/bank/import`;
const SOURCE = "cashfluencer-character-bank";
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const BANK_TIMEOUT_MS = 15 * 1000;
const PHOTO_TIMEOUT_MS = 30 * 1000;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function joined(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(", ");
  return text(value);
}

// Vérifie le lien avec un vrai parseur d'URL : HTTPS, hôte exact, aucun identifiant,
// aucun port non standard, chemin /import, aucune query string, fragment token=<64 hex>.
function readToken(link) {
  const raw = text(link);
  if (!raw) return "";
  let url;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }
  if (url.protocol !== "https:") return "";
  if (url.hostname !== BANK_HOST) return "";
  if (url.username || url.password) return "";
  if (url.port) return "";
  if (url.pathname !== "/import" && url.pathname !== "/import/") return "";
  if (url.search) return "";
  if (!url.hash.startsWith("#token=")) return "";
  const token = url.hash.slice("#token=".length);
  return TOKEN_PATTERN.test(token) ? token : "";
}

async function callBank(token) {
  let res;
  try {
    res = await fetch(BANK_IMPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      // Les redirections ne sont jamais suivies : "manual" laisse la réponse telle quelle
      // et la redirection est refusée ci-dessous (le runtime n'accepte pas "error").
      redirect: "manual",
      signal: AbortSignal.timeout(BANK_TIMEOUT_MS),
    });
  } catch {
    // Réseau ou délai dépassé : le personnage reste réservé, l'appel peut être repris.
    return { code: "UNAVAILABLE", status: 503 };
  }

  if (res.status >= 300 && res.status < 400) {
    return { code: "UNAVAILABLE", status: 503 };
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  const apiCode = text(payload && payload.error);

  if (res.status === 400) {
    return apiCode === "BAD_BODY" ? { code: "UNEXPECTED", status: 502 } : { code: "INVALID_LINK", status: 400 };
  }
  if (res.status === 404 || apiCode === "LINK_NOT_FOUND") return { code: "LINK_NOT_FOUND", status: 404 };
  if (!res.ok) return { code: "UNAVAILABLE", status: 503 };
  if (!payload || typeof payload !== "object") return { code: "UNEXPECTED", status: 502 };
  return { data: payload };
}

// Une photo n'est acceptée que sur la banque, en HTTPS, sans identifiant, sans port,
// sans query string, sans fragment, au chemin exact attendu.
function isBankAsset(rawUrl, expectedPath) {
  const value = text(rawUrl);
  if (!value) return false;
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname !== BANK_HOST) return false;
  if (url.username || url.password) return false;
  if (url.port) return false;
  if (url.pathname !== expectedPath) return false;
  if (url.search || url.hash) return false;
  return true;
}

function readProfile(data) {
  if (data.schema_version !== 1) return null;
  if (data.source !== SOURCE) return null;
  if (data.fictional !== true) return null;
  if (!text(data.import_id)) return null;

  const character = data.character;
  if (!character || typeof character !== "object") return null;
  if (!text(character.id) || !text(character.name)) return null;

  const assets = data.assets && typeof data.assets === "object" ? data.assets : {};
  const full = assets.full_body;
  const portrait = assets.portrait;
  if (!full || !portrait) return null;

  const id = String(character.id);
  if (text(full.mime_type).toLowerCase() !== "image/jpeg") return null;
  if (text(portrait.mime_type).toLowerCase() !== "image/jpeg") return null;
  if (!isBankAsset(full.url, `/img/${id}.jpg`)) return null;
  if (!isBankAsset(portrait.url, `/img/${id}_face.jpg`)) return null;

  return {
    importId: text(data.import_id),
    eventId: text(data.event_id),
    character,
    fullUrl: text(full.url),
    portraitUrl: text(portrait.url),
  };
}

// Fiche du personnage traduite en description lisible : c'est ce texte qui reprend
// apparence, tenue, personnalité et voix dans le parcours vidéo.
function describeCharacter(character) {
  const lines = [];
  const gender = joined(character.gender);
  const age = joined(character.age);
  const appearance = [
    gender,
    age ? `${age} ans` : "",
    joined(character.ethnicity),
    joined(character.height),
    joined(character.build),
    joined(character.hair) ? `cheveux : ${joined(character.hair)}` : "",
    joined(character.facial_hair) ? `pilosité : ${joined(character.facial_hair)}` : "",
    joined(character.face_features),
    joined(character.skin),
    character.is_animal === true ? `animal${joined(character.species) ? ` (${joined(character.species)})` : ""}` : "",
  ].filter(Boolean).join(", ");
  if (appearance) lines.push(`Apparence : ${appearance}.`);
  if (joined(character.outfit)) lines.push(`Tenue : ${joined(character.outfit)}.`);
  if (joined(character.accessories)) lines.push(`Accessoires : ${joined(character.accessories)}.`);
  if (joined(character.piercings)) lines.push(`Piercings : ${joined(character.piercings)}.`);
  if (joined(character.tattoos)) lines.push(`Tatouages : ${joined(character.tattoos)}.`);
  if (joined(character.personality)) lines.push(`Personnalité : ${joined(character.personality)}.`);
  if (joined(character.voice_accent)) lines.push(`Voix : ${joined(character.voice_accent)}.`);
  if (joined(character.signature_move)) lines.push(`Mouvement signature : ${joined(character.signature_move)}.`);
  if (joined(character.content_format)) lines.push(`Format de contenu : ${joined(character.content_format)}.`);
  if (joined(character.setting)) lines.push(`Décor habituel : ${joined(character.setting)}.`);
  if (joined(character.nationality) || joined(character.continent)) {
    lines.push(`Origine : ${[joined(character.nationality), joined(character.continent)].filter(Boolean).join(", ")}.`);
  }
  if (joined(character.category_label) || joined(character.category)) {
    lines.push(`Catégorie : ${joined(character.category_label) || joined(character.category)}.`);
  }
  if (joined(character.tags)) lines.push(`Mots-clés : ${joined(character.tags)}.`);
  return lines.join(" ");
}

function personalityTraits(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  const raw = text(value);
  return raw ? raw.split(/\s*[,;·]\s*/).map(text).filter(Boolean) : [];
}

// Champs réellement lus par le parcours vidéo, plus la fiche d'origine conservée telle quelle.
function recordFields(profile, userId) {
  const character = profile.character;
  const fields = {
    import_key: `${userId}|${SOURCE}|${profile.importId}`,
    name: text(character.name),
    source: SOURCE,
    source_character_id: String(character.id),
    import_id: profile.importId,
    profile: character,
    notes: describeCharacter(character),
  };
  if (profile.eventId) fields.source_event_id = profile.eventId;
  const label = text(character.category_label) || text(character.category);
  if (label) fields.niche = label;
  if (text(character.viral_hook)) fields.tagline = text(character.viral_hook);
  const traits = personalityTraits(character.personality);
  if (traits.length) fields.personality = traits;
  return fields;
}

async function findByKey(base44, key) {
  const page = await base44.entities.Influencer.filter({ import_key: key }, { limit: 1 });
  return (page.items || [])[0] || null;
}

// Création ou mise à jour atomique : la clé utilisateur + source + import_id est unique,
// deux requêtes simultanées ne peuvent donc pas créer deux personnages.
async function upsertRecord(base44, fields) {
  const result = await base44.entities.Influencer.upsert([fields], { key: "import_key" });
  const written = Array.isArray(result && result.records) ? result.records[0] : null;
  if (written) return written;
  return findByKey(base44, fields.import_key);
}

function isReady(record) {
  return Boolean(record && record.import_status === "ready" && record.reference_image && record.face_reference_image);
}

async function storePhoto(base44, url, filename) {
  const res = await fetch(url, {
    // Une redirection est refusée : seuls les chemins exacts de la banque sont acceptés.
    redirect: "manual",
    headers: { Accept: "image/jpeg" },
    signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error("photo indisponible");
  const type = text(res.headers.get("content-type")).split(";")[0].trim().toLowerCase();
  if (type !== "image/jpeg") throw new Error("format inattendu");
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > MAX_PHOTO_BYTES) throw new Error("photo trop volumineuse");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) throw new Error("photo trop volumineuse");
  const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
    file: new File([bytes], filename, { type: "image/jpeg" }),
  });
  const uri = upload && upload.file_uri;
  if (!uri) throw new Error("stockage indisponible");
  return uri;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ code: "NOT_AUTHENTICATED" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const step = body && body.step === "prepare" ? "prepare" : "resolve";

    const token = readToken(body && body.link);
    if (!token) return Response.json({ code: "INVALID_LINK" }, { status: 400 });

    const bank = await callBank(token);
    if (bank.code) return Response.json({ code: bank.code }, { status: bank.status });

    const profile = readProfile(bank.data);
    if (!profile) return Response.json({ code: "UNEXPECTED" }, { status: 502 });

    const importKey = `${user.id}|${SOURCE}|${profile.importId}`;
    const existing = await findByKey(base44, importKey);
    if (isReady(existing)) {
      return Response.json({ status: "ready", already: true, influencer: existing });
    }

    const fields = recordFields(profile, user.id);

    if (step === "resolve") {
      // Le personnage n'est pas encore prêt : sa fiche est enregistrée pour permettre
      // la reprise, sans jamais le marquer comme prêt avant ses deux photos.
      if (!existing) fields.import_status = "pending";
      const record = await upsertRecord(base44, fields);
      if (!record) return Response.json({ code: "UNEXPECTED" }, { status: 502 });
      return Response.json({ status: isReady(record) ? "ready" : "pending", already: false, influencer: record });
    }

    const record = existing || await upsertRecord(base44, { ...fields, import_status: "pending" });
    if (!record) return Response.json({ code: "UNEXPECTED" }, { status: 502 });

    const characterId = String(profile.character.id);
    let fullUri = text(record.reference_image);
    let faceUri = text(record.face_reference_image);
    const stored = {};

    try {
      if (!fullUri) {
        fullUri = await storePhoto(base44, profile.fullUrl, `personnage-${characterId}.jpg`);
        stored.reference_image = fullUri;
      }
      if (!faceUri) {
        faceUri = await storePhoto(base44, profile.portraitUrl, `personnage-${characterId}-visage.jpg`);
        stored.face_reference_image = faceUri;
      }
    } catch {
      // Les photos déjà récupérées sont conservées : la tentative suivante termine le
      // même import au lieu d'en créer un nouveau.
      if (Object.keys(stored).length) {
        await base44.entities.Influencer.update(record.id, stored);
      }
      return Response.json({ code: "PHOTOS" }, { status: 502 });
    }

    const updated = await base44.entities.Influencer.update(record.id, {
      reference_image: fullUri,
      reference_images: [faceUri],
      face_reference_image: faceUri,
      import_status: "ready",
      imported_at: record.imported_at || new Date().toISOString(),
    });
    return Response.json({ status: "ready", already: false, influencer: updated });
  } catch {
    return Response.json({ code: "UNAVAILABLE" }, { status: 503 });
  }
}