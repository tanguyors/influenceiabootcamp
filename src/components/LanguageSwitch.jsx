import { LANGUAGES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageSwitch({ className }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border p-0.5", className)}>
      {LANGUAGES.map((language) => (
        <button
          key={language.id}
          type="button"
          onClick={() => setLang(language.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
            lang === language.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}