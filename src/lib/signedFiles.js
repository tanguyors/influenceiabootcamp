import { base44 } from "@/api/base44Client";

// Un lien signé reste valable une heure : on le garde en mémoire pour ne pas resigner le
// même fichier à chaque affichage, ni à chaque retour sur une page.
const CACHE = new Map();
const EXPIRES_IN = 3600;
const SAFETY_MS = 5 * 60 * 1000;

export function isRemoteUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

export function signedUrlFor(fileUri) {
  const hit = CACHE.get(fileUri);
  if (hit && hit.expiresAt > Date.now()) return Promise.resolve(hit.url);
  return base44.integrations.Core
    .CreateFileSignedUrl({ file_uri: fileUri, expires_in: EXPIRES_IN })
    .then(({ signed_url }) => {
      if (signed_url) {
        CACHE.set(fileUri, { url: signed_url, expiresAt: Date.now() + EXPIRES_IN * 1000 - SAFETY_MS });
      }
      return signed_url || "";
    });
}

// Les fichiers privés signés sont servis par le service média : la même URL accepte donc
// une version redimensionnée, jeton d'accès conservé.
const MEDIA_PREFIXES = { "media.base44.com": "/images/", "static.wixstatic.com": "/media/" };

export function transformTarget(signedUrl) {
  try {
    const url = new URL(signedUrl);
    const prefix = MEDIA_PREFIXES[url.hostname];
    if (!prefix || !url.pathname.startsWith(prefix)) return null;
    const segments = url.pathname.split("/");
    const filename = segments.pop();
    if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(filename)) return null;
    return { baseUrl: `${url.origin}${segments.join("/")}/${filename}`, filename, search: url.search };
  } catch {
    return null;
  }
}