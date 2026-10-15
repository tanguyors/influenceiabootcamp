import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { buildTransformUrl } from "@/components/ui/image-helpers";
import { isRemoteUrl, signedUrlFor, transformTarget } from "@/lib/signedFiles";
import { cn } from "@/lib/utils";

const DPRS = [1, 2, 3];
const FALLBACK_WIDTH = 1024;

// Renders a privately-stored file (file_uri) from a signed URL kept in memory, then a version
// resized and cropped by the media service to the size actually displayed.
export default function SignedImage({ src, alt = "", className, fittingType = "fill" }) {
  const [url, setUrl] = useState("");
  const [plain, setPlain] = useState(false);
  const [size, setSize] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(""); return; }
    // Already a public/http URL (e.g. demo or external) — render directly.
    if (isRemoteUrl(src)) { setUrl(src); return; }
    signedUrlFor(src)
      .then((signed) => { if (alive) setUrl(signed); })
      .catch(() => { if (alive) setUrl(""); });
    return () => { alive = false; };
  }, [src]);

  useEffect(() => setPlain(false), [url]);

  // Mesure avant peinture : la bonne taille part au premier rendu, sans télécharger
  // l'image en pleine résolution puis la remplacer.
  useLayoutEffect(() => {
    const element = imgRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.width) setSize({ width: rect.width, height: rect.height });
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [url]);

  if (!url) return null;

  const fitClass = fittingType === "fit" ? "object-contain" : "object-cover";
  // Les fichiers privés n'ont pas droit au redimensionnement automatique du composant Image :
  // on le demande ici, à la taille réellement affichée (une vignette de 48 px ne télécharge
  // plus la planche complète). Si le service refuse, on retombe sur le fichier d'origine.
  const target = plain ? null : transformTarget(url);

  if (!target) {
    return <img ref={imgRef} src={url} alt={alt} loading="lazy" decoding="async" className={cn(fitClass, className)} />;
  }

  const width = size && size.width >= 8 ? Math.round(size.width) : FALLBACK_WIDTH;
  const height = size && size.height >= 8 ? Math.round(size.height) : undefined;
  const options = { width, height, crop: fittingType !== "fit", quality: 80 };
  const srcSet = DPRS
    .map((dpr) => `${buildTransformUrl(target, { ...options, width: width * dpr, height: height ? height * dpr : undefined })}${target.search} ${dpr}x`)
    .join(", ");

  return (
    <img
      ref={imgRef}
      src={`${buildTransformUrl(target, options)}${target.search}`}
      srcSet={srcSet}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setPlain(true)}
      className={cn(fitClass, className)}
    />
  );
}