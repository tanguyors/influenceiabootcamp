import CopyPromptRow from "@/components/CopyPromptRow";
import { allPrompts } from "@/lib/base44Prompts";
import { useI18n } from "@/lib/i18n";

export default function HowPromptList() {
  const { lang } = useI18n();

  return (
    <div className="space-y-2">
      {allPrompts(lang).map((text) => (
        <CopyPromptRow key={text} text={text} />
      ))}
    </div>
  );
}