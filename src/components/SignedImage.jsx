import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image as ContentImage } from "@/components/ui/image";
import { cn } from "@/lib/utils";

// Renders a privately-stored file (file_uri) by obtaining a short-lived signed URL.
export default function SignedImage({ src, alt = "", className, fittingType = "fill" }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(""); return; }
    // Already a public/http URL (e.g. demo or external) — render directly.
    if (/^https?:\/\//.test(src)) { setUrl(src); return; }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: src })
      .then(({ signed_url }) => { if (alive) setUrl(signed_url); })
      .catch(() => { if (alive) setUrl(""); });
    return () => { alive = false; };
  }, [src]);

  if (!url) return null;
  // Les fichiers privés ne passent pas par le redimensionnement automatique : le cadrage
  // demandé (remplir / contenir) doit donc être appliqué ici, sinon l'image est étirée.
  return (
    <ContentImage
      src={url}
      alt={alt}
      fittingType={fittingType}
      className={cn(fittingType === "fit" ? "object-contain" : "object-cover", className)}
    />
  );
}