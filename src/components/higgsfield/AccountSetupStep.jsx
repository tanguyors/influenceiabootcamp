import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetupStepCard from "@/components/higgsfield/SetupStepCard";

// Étape 1 : création du compte Higgsfield via notre lien.
export default function AccountSetupStep({ url, connected }) {
  return (
    <SetupStepCard
      num={1}
      done={connected}
      title="Créer votre compte Higgsfield"
      text={
        connected
          ? "Votre compte Higgsfield est actif."
          : "Pas encore de compte ? Créez-le en un clic : vous partez sur la bonne offre et vous soutenez l'application."
      }
    >
      <Button asChild variant={connected ? "ghost" : "outline"} className="w-full">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          {connected ? "Ouvrir Higgsfield" : "Créer mon compte Higgsfield"}
        </a>
      </Button>
    </SetupStepCard>
  );
}