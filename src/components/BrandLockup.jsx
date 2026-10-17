import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/6acf818406c8aa81ac77512c/8baf17bdd_logo.png";

// Signature de marque : le logo dans sa pastille verte, suivi du nom et de la promesse.
export default function BrandLockup({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary p-1">
        <Image
          src={LOGO_URL}
          alt="InfluenceIA"
          fittingType="fit"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="leading-tight">
        <div className="font-heading text-[15px] font-semibold tracking-tight">InfluenceIA</div>
        <div className="text-[11px] text-muted-foreground">Influenceur IA · Vidéos virales</div>
      </div>
    </div>
  );
}