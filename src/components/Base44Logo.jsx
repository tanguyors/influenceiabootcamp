import { Image } from "@/components/ui/image";

// Marque Base44 : sert à incarner le copilote (le « cerveau » de l'app).
const BASE44_LOGO_URL = "https://base44.com/logo_v2.svg";

export default function Base44Logo({ className = "h-5 w-5" }) {
  return (
    <Image
      src={BASE44_LOGO_URL}
      alt="Base44"
      fittingType="fit"
      className={className}
    />
  );
}