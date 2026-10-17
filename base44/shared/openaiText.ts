import { secrets } from "base44:runtime";

const MODEL = "gpt-4o-mini";

export function clean(value: any, max: number) {
  return String(value || "").trim().slice(0, max);
}

// Appel OpenAI commun aux textes de personnage : schéma JSON strict, erreurs traduites,
// jamais de texte repassé tel quel sans validation du format.
export async function openAiJson(opts: {
  schemaName: string;
  schema: any;
  system: string;
  user: string;
  maxTokens: number;
  timeoutMs?: number;
}): Promise<{ data?: any; error?: string; status?: number }> {
  const key = secrets.get("OPENAI_API_KEY");
  if (!key) return { error: "Clé OpenAI manquante : ajoutez le secret OPENAI_API_KEY.", status: 400 };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 1,
      max_tokens: opts.maxTokens,
      response_format: {
        type: "json_schema",
        json_schema: { name: opts.schemaName, strict: true, schema: opts.schema },
      },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
    signal: AbortSignal.timeout(opts.timeoutMs || 90000),
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = "";
    try { message = JSON.parse(raw)?.error?.message || ""; } catch { message = raw.slice(0, 200); }
    if (res.status === 401) {
      return { error: "Clé OpenAI refusée : vérifiez le secret OPENAI_API_KEY.", status: 400 };
    }
    if (res.status === 429) {
      const quota = /quota|billing|credit/i.test(message);
      return {
        error: quota
          ? "Compte OpenAI sans crédit disponible : ajoutez un moyen de paiement sur platform.openai.com, puis relancez."
          : "Trop de requêtes OpenAI en peu de temps : réessayez dans un instant.",
        status: 400,
      };
    }
    return { error: message || `OpenAI a refusé la génération (${res.status}).`, status: 502 };
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content || "{}";
  try {
    return { data: JSON.parse(content) };
  } catch {
    return { data: {} };
  }
}