import CopyPromptRow from "@/components/CopyPromptRow";
import { ALL_PROMPTS } from "@/lib/base44Prompts";

export default function HowPromptList() {
  return (
    <div className="space-y-2">
      {ALL_PROMPTS.map((text) => (
        <CopyPromptRow key={text} text={text} />
      ))}
    </div>
  );
}