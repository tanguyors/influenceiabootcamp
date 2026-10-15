// Lecture générique des réponses du serveur MCP Higgsfield (transport dans higgsfield.ts).

export function resultText(res: any): string {
  if (!res) return "";
  if (typeof res === "string") return res;
  if (Array.isArray(res.content)) return res.content.map((c: any) => (c && c.text) || "").join(" ");
  if (res.text) return res.text;
  return "";
}

// Toutes les chaînes d'un résultat MCP. Le sous-objet "params" est ignoré : il ne contient
// que l'écho de la requête (médias d'entrée), jamais le résultat produit.
export function collectStrings(value: any, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (key === "params") continue;
      collectStrings(v, out);
    }
  }
  return out;
}

// Identifiant de tâche renvoyé par Higgsfield, quelle que soit la mise en forme.
export function readJobId(res: any): string {
  const sc = (res && res.structuredContent) || {};
  const layers = [sc, sc.generation, sc.job, sc.data, sc.result].filter((l) => l && typeof l === "object");
  for (const layer of layers) {
    const id = layer.job_id || layer.jobId || layer.id;
    if (id) return String(id);
  }
  const m = resultText(res).match(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/);
  return m ? m[0] : "";
}