// Lit la durée réelle d'une vidéo dans le navigateur : fichier choisi ou URL signée.
export function readVideoDuration(source) {
  return new Promise((resolve) => {
    const isFile = typeof source !== "string";
    const url = isFile ? URL.createObjectURL(source) : source;
    const el = document.createElement("video");
    el.preload = "metadata";
    const done = (value) => {
      if (isFile) URL.revokeObjectURL(url);
      resolve(value);
    };
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? Math.round(el.duration) : null);
    el.onerror = () => done(null);
    el.src = url;
  });
}