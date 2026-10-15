import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SetupStepCard from "@/components/higgsfield/SetupStepCard";

// Étape 1 : création du compte Higgsfield via notre lien. Obligatoire avant la connexion.
export default function AccountSetupStep({ done, onOpen }) {
  return (
    <SetupStepCard
      num={1}
      done={done}
      title="Créer votre compte Higgsfield"
      text={
        done
          ? "Votre compte Higgsfield est actif."
          : "Pas encore de compte ? Créez-le en un clic : vous partez sur la bonne offre et vous soutenez l'application."
      }
    >
      <Button onClick={onOpen} variant={done ? "ghost" : "default"} className="w-full font-semibold">
        <ExternalLink className="mr-2 h-4 w-4" />
        {done ? "Ouvrir Higgsfield" : "Créer mon compte Higgsfield"}
      </Button>
      {!done && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Obligatoire : l'étape 2 se débloque juste après.
        </p>
      )}
    </SetupStepCard>
  );
}