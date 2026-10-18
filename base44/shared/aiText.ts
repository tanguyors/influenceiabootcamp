export function clean(value: any, max: number) {
  return String(value || "").trim().slice(0, max);
}

// Textes de personnage : l'IA incluse dans Base44, sans clé ni compte externe à fournir.
// Elle est appelée côté serveur avec le rôle de service et consomme les crédits d'intégration
// du propriétaire de l'application.
export async function aiJson(
  base44: any,
  opts: { schema: any; system: string; user: string }
): Promise<{ data?: any; error?: string; status?: number }> {
  try {
    const data = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [
        opts.system,
        "",
        opts.user,
        "",
        "Réponds uniquement par un objet JSON valide, conforme au schéma imposé, sans texte autour.",
      ].join("\n"),
      response_json_schema: opts.schema,
    });
    return { data: data && typeof data === "object" ? data : {} };
  } catch (error: any) {
    return { error: error?.message || "L'IA n'a pas pu répondre : relancez.", status: 502 };
  }
}