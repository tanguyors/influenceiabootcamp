import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Aperçu d'une vidéo stockée de façon privée : URL signée, lecture en boucle et sans son.
export default function SignedVideo({ src, className }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(""); return; }
    // Fichier déjà public ou distant — lecture directe.
    if (/^https?:\/\//.test(src)) { setUrl(src); return; }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: src, expires_in: 3600 })
      .then(({ signed_url }) => { if (alive) setUrl(signed_url); })
      .catch(() => { if (alive) setUrl(""); });
    return () => { alive = false; };
  }, [src]);

  if (!url) return null;
  return <video src={url} className={className} muted loop autoPlay playsInline preload="metadata" />;
}