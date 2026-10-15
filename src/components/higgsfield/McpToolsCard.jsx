import { Loader2, Plug, Wrench } from "lucide-react";

// Outils MCP réellement exposés par le compte Higgsfield connecté.
export default function McpToolsCard({ tools, connected }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-heading text-base font-semibold tracking-tight">Outils MCP disponibles</h2>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Découverts automatiquement via <code className="rounded bg-secondary px-1">tools/list</code>. La génération utilise les outils réellement exposés par votre compte.
      </p>

      <div className="mt-5">
        {tools === null ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <Plug className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {connected ? "Aucun outil retourné par le serveur MCP." : "Connectez votre compte Higgsfield pour découvrir les outils."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tools.map((t) => (
              <div key={t.name} className="rounded-lg border border-border p-3">
                <div className="font-mono text-xs font-semibold text-foreground">{t.name}</div>
                {t.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}