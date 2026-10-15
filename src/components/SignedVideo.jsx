import { useEffect, useState } from "react";
import { isRemoteUrl, signedUrlFor } from "@/lib/signedFiles";

// Aperçu d'une vidéo stockée de façon privée : URL signée, lecture en boucle et sans son.
export default function SignedVideo({ src, className }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(""); return; }
    // Fichier déjà public ou distant — lecture directe.
    if (isRemoteUrl(src)) { setUrl(src); return; }
    signedUrlFor(src)
      .then((signed) => { if (alive) setUrl(signed); })
      .catch(() => { if (alive) setUrl(""); });
    return () => { alive = false; };
  }, [src]);

  if (!url) return null;
  return <video src={url} className={className} muted loop autoPlay playsInline preload="metadata" />;
}