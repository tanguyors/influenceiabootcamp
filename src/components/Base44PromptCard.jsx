import { cn } from "@/lib/utils";
import Base44Logo from "@/components/Base44Logo";
import CopyPromptRow from "@/components/CopyPromptRow";

export default function Base44PromptCard({ group, action, className }) {
  if (!group) return null;

  return (
    <div className={cn("rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 p-1.5">
            <Base44Logo className="h-full w-full" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold tracking-tight">{group.title}</p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">{group.intro}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="mt-3 space-y-2">
        {group.prompts.map((text) => (
          <CopyPromptRow key={text} text={text} />
        ))}
      </div>
    </div>
  );
}