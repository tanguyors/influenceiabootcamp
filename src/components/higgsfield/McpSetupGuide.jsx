import { ExternalLink, Rocket } from "lucide-react";
import { Image } from "@/components/ui/image";
import SetupStepCard from "@/components/higgsfield/SetupStepCard";

// Étapes 2 et 3 : l'application doit être publiée, puis ouverte hors Base44,
// avant de pouvoir connecter le compte Higgsfield (étape 4).
const PUBLISH_SCREEN = "https://media.base44.com/images/public/6acf818406c8aa81ac77512c/a3cf69f6c_image.png";
const ONLINE_SCREEN = "https://media.base44.com/images/public/6acf818406c8aa81ac77512c/61efb5cde_image.png";

const STEPS = [
  {
    num: 2,
    icon: Rocket,
    title: "Publiez l'application",
    text: "Dans Base44, cliquez sur Publier (en haut à droite) et suivez la fenêtre de publication. C'est l'adresse publique obtenue ici qui porte la connexion MCP.",
    image: PUBLISH_SCREEN,
    alt: "Fenêtre de publication dans Base44, avec l'URL de l'application",
  },
  {
    num: 3,
    icon: ExternalLink,
    title: "Ouvrez le lien de votre app",
    text: "Quand « Votre application est en ligne » s'affiche, copiez l'URL de votre application et ouvrez-la dans un navigateur normal, hors Base44.",
    image: ONLINE_SCREEN,
    alt: "Fenêtre de confirmation avec l'URL de l'application publiée",
  },
];

export default function McpSetupGuide({ className = "" }) {
  return (
    <div className={className}>
      {STEPS.map((step) => (
        <SetupStepCard key={step.num} num={step.num} icon={step.icon} hideStatus title={step.title} text={step.text}>
          <Image
            src={step.image}
            alt={step.alt}
            fittingType="fit"
            className="h-64 w-full rounded-xl border border-border bg-secondary"
          />
        </SetupStepCard>
      ))}
    </div>
  );
}