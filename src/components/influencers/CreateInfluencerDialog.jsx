import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PhotoInfluencerForm from "@/components/influencers/PhotoInfluencerForm";

export default function CreateInfluencerDialog({ open, onOpenChange, onCreated }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer mes photos</DialogTitle>
        </DialogHeader>
        <PhotoInfluencerForm onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  );
}