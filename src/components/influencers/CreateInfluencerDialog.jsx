import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoInfluencerForm from "@/components/influencers/PhotoInfluencerForm";
import AiInfluencerForm from "@/components/influencers/AiInfluencerForm";

export default function CreateInfluencerDialog({ open, onOpenChange, onCreated }) {
  const [mode, setMode] = useState("ai");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un influenceur</DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">Générer par IA</TabsTrigger>
            <TabsTrigger value="photos">Mes photos</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-4">
            <AiInfluencerForm onCreated={onCreated} />
          </TabsContent>
          <TabsContent value="photos" className="mt-4">
            <PhotoInfluencerForm onCreated={onCreated} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}