import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Banque de modèles : import des vidéos déposées dans un dossier Google Drive public.
// Le dossier racine et ses sous-dossiers sont parcourus ; chaque sous-dossier donne sa catégorie.
const ROOT_FOLDER = "17-T4L8JQb-h8pCw5__xG4g8msD_i3MO0";
const MAX_BYTES = 60000000;
const MAX_DEPTH = 4;
const DEADLINE_MS = 230000;
const BATCH = 1;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const VIDEO_FILE = /\.(mp4|mov|m4v|webm)$/i;

const CATEGORIES = {
  "beaute": "beaute",
  "beauté": "beaute",
  "cosplay": "mode",
  "danse": "danse",
  "danse duo": "danse",
  "sport": "fitness",
  "trend usa": "lifestyle",
};

function decodeHtml(value) {
  return String(value)
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

// Liste d'un dossier public : la vue « embeddedfolderview » ne demande aucun compte.
async function listFolder(folderId) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#list`, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const entries = [];
  for (const chunk of html.split('<div class="flip-entry"').slice(1)) {
    const id = (chunk.match(/id="entry-([^"]+)"/) || [])[1];
    const title = (chunk.match(/<div class="flip-entry-title">([^<]*)<\/div>/) || [])[1];
    if (!id || !title) continue;
    entries.push({ id, title: decodeHtml(title).trim(), folder: chunk.includes("/drive/folders/") });
  }
  return entries;
}

async function walk(folderId, label, depth, found) {
  if (depth > MAX_DEPTH) return;
  const entries = await listFolder(folderId);
  for (const entry of entries) {
    if (entry.folder) await walk(entry.id, label || entry.title, depth + 1, found);
    else if (VIDEO_FILE.test(entry.title)) found.push({ id: entry.id, name: entry.title, label: label || "Modèles" });
  }
}

// Un fichier public se télécharge par le service « download » de Drive. Au-delà d'une
// certaine taille, Drive renvoie d'abord une page de confirmation : on rejoue avec son jeton.
async function openDriveFile(fileId) {
  const endpoint = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
  const first = await fetch(`${endpoint}&confirm=t`, {
    headers: { "User-Agent": UA },
    redirect: "follow",
    signal: AbortSignal.timeout(150000),
  });
  if (first.ok && !(first.headers.get("content-type") || "").includes("text/html")) return first;

  const html = await first.text().catch(() => "");
  const token = (html.match(/confirm=([0-9A-Za-z_-]+)/) || [])[1];
  if (!token) return null;
  const uuid = (html.match(/name="uuid" value="([^"]+)"/) || [])[1];
  const retry = await fetch(`${endpoint}&confirm=${token}${uuid ? `&uuid=${uuid}` : ""}`, {
    headers: { "User-Agent": UA },
    redirect: "follow",
    signal: AbortSignal.timeout(240000),
  });
  if (!retry.ok || (retry.headers.get("content-type") || "").includes("text/html")) return null;
  return retry;
}

// Le fichier descendu est rangé dans le stockage privé de l'app : la banque de modèles n'utilise que du privé.
async function store(base44, entry, stamp) {
  const res = await openDriveFile(entry.id);
  if (!res) return { error: "téléchargement refusé par Drive (le dossier doit être partagé en lecture par lien)" };
  const announced = Number(res.headers.get("content-length")) || 0;
  if (announced > MAX_BYTES) return { error: `fichier trop lourd (${Math.round(announced / 1048576)} Mo, maximum 60 Mo)` };

  // Lecture par blocs avec arrêt net : une vidéo de plusieurs centaines de Mo ne doit jamais
  // être chargée d'un coup, sinon le worker tombe en mémoire.
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      return { error: `fichier trop lourd (plus de ${Math.round(MAX_BYTES / 1048576)} Mo)` };
    }
    chunks.push(value);
  }
  if (!total) return { error: "fichier vide" };
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const ext = ((entry.name.match(/\.([a-z0-9]+)$/i) || [])[1] || "mp4").toLowerCase();
  const type = { mov: "video/quicktime", m4v: "video/x-m4v", webm: "video/webm" }[ext] || "video/mp4";
  const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
    file: new File([buffer], `modele-drive-${stamp}.${ext}`, { type }),
  });
  if (!upload || !upload.file_uri) return { error: "enregistrement impossible dans le stockage de l'app" };
  return { file_uri: upload.file_uri, megabytes: Math.round(total / 1048576) };
}

// Un fichier nommé par un identifiant technique n'apprend rien : on le nomme par son dossier.
function titleFor(entry, rank) {
  const stem = entry.name.replace(/\.[a-z0-9]+$/i, "").trim();
  if (!stem || /^[-_\d]+$/.test(stem) || /^(snaptik|hf|video|vid|download|untitled)/i.test(stem)) {
    return `${entry.label} ${rank}`;
  }
  return stem.replace(/[_]+/g, " ").slice(0, 120);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const root = String(body.folder_id || ROOT_FOLDER).trim();
    if (!/^[A-Za-z0-9_-]{10,}$/.test(root)) {
      return Response.json({ error: "Identifiant de dossier Drive invalide." }, { status: 400 });
    }

    const found = [];
    await walk(root, "", 0, found);

    // Les modèles déjà présents ne sont pas retéléchargés : la source Drive sert de clé.
    const existing = new Set();
    let cursor = "";
    for (let page = 0; page < 20; page += 1) {
      const options = { limit: 200, fields: ["id", "source_url"] };
      if (cursor) options.cursor = cursor;
      const result = await base44.entities.ViralVideo.filter({}, options);
      for (const item of result.items || []) existing.add(item.source_url || "");
      if (!result.has_more) break;
      cursor = result.next_cursor;
    }

    const ranks = {};
    const pending = [];
    for (const entry of found) {
      ranks[entry.label] = (ranks[entry.label] || 0) + 1;
      const source_url = `https://drive.google.com/file/d/${entry.id}/view`;
      if (existing.has(source_url)) continue;
      pending.push({ ...entry, source_url, rank: ranks[entry.label] });
    }

    // `limit` sert à traiter la file par petits lots : l'import complet demande plusieurs passages.
    const requested = Math.min(Math.max(Number(body.limit) || pending.length, 1), pending.length);
    const deadline = Date.now() + DEADLINE_MS;
    const queue = pending.slice(0, requested);
    const created = [];
    const failed = [];
    const imported = [];
    let index = 0;

    while (index < queue.length && Date.now() < deadline) {
      const slice = queue.slice(index, index + BATCH);
      const results = await Promise.allSettled(
        slice.map((entry) => store(base44, entry, Date.now() + entry.rank)),
      );
      results.forEach((result, offset) => {
        const entry = slice[offset];
        if (result.status === "rejected") {
          failed.push({ name: entry.name, reason: String(result.reason && result.reason.message || result.reason) });
          return;
        }
        if (result.value.error) {
          failed.push({ name: entry.name, reason: result.value.error });
          return;
        }
        created.push({
          title: titleFor(entry, entry.rank),
          source_url: entry.source_url,
          video_file_uri: result.value.file_uri,
          category: CATEGORIES[entry.label.toLowerCase()] || undefined,
          published_date: new Date(Date.now() - created.length * 1000).toISOString(),
          is_manual: true,
          is_demo: false,
        });
        imported.push({ name: entry.name, megabytes: result.value.megabytes });
      });
      index += slice.length;
    }

    if (created.length) await base44.entities.ViralVideo.bulkCreate(created);

    // Reste à traiter sur l'ensemble de la file : un `remaining` positif demande un nouveau passage.
    const remaining = pending.length - index;
    return Response.json({
      found: found.length,
      folders: ranks,
      created: created.length,
      imported,
      already_present: found.length - pending.length,
      failed,
      remaining,
      done: remaining === 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}