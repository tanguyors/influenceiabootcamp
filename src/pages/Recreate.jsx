import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowLeft, Wand2, Info, Image as ImageIcon, Film, FileVideo, AlertTriangle } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import SignedImage from "@/components/SignedImage";
import { findDemoVideo } from "@/lib/demoVideos";

const RESOLUTIONS = ["480p", "720p", "1080p"];

export default function Recreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const videoId = params.get("video");

  const [video, setVideo] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("influenceia.activeInfluencer") || "");
  const [connection, setConnection] = useState(null); // null | { connected, message }
  const [launching, setLaunching] = useState(false);
  const [form, setForm] = useState({
    resolution: "1080p",
    wardrobe: "",
    setting: "",
    instructions: "",
  });

  async function loadAll() {
    try {
      const [infPage, vidPage] = await Promise.all([
        base44.entities.Influencer.filter({}, { sort: "-created_date", limit: 50 }),
        videoId ? base44.entities.ViralVideo.filter({ id: videoId }, { limit: 1 }) : Promise.resolve({ items: [] }),
      ]);
      setInfluencers(infPage.items || []);
      const vid = (vidPage.items || [])[0];
      if (vid) setVideo(vid);
      else if (videoId) setVideo(findDemoVideo(videoId));
    } catch (e) {
      /* entities may not exist yet */
    }
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", { action: "status" });
      setConnection(res.data || {});
    } catch (e) {
      setConnection({ connected: false, message: "Vérification de la connexion Higgsfield impossible." });
    }
  }
  useEffect(() => { loadAll(); }, [videoId]);

  const selectedInfluencer = influencers.find((i) => i.id === activeId);
  const hasSourceVideo = Boolean(video?.video_file_uri);

  async function launch() {
    if (!selectedInfluencer) {
      toast({ title: "Sélectionnez un influenceur", variant: "destructive" });
      return;
    }
    if (!video) {
      toast({ title: "Vidéo de référence introuvable", variant: "destructive" });
      return;
    }
    if (!hasSourceVideo) {
      toast({ title: "Vidéo source manquante", description: "Ajoutez le fichier mp4 de la référence dans la bibliothèque.", variant: "destructive" });
      return;
    }
    setLaunching(true);
    try {
      await base44.functions.invoke("generateVideo", {
        influencer_id: selectedInfluencer.id,
        viral_video_id: video.id,
        resolution: form.resolution,
        wardrobe: form.wardrobe.trim(),
        setting: form.setting.trim(),
        instructions: form.instructions.trim(),
      });
      toast({ title: "Génération lancée", description: "Suivez l'état dans Mes créations." });
      navigate("/creations");
    } catch (e) {
      toast({ title: "Lancement impossible", description: e.message, variant: "destructive" });
    } finally {
      setLaunching(false);
    }
  }

  if (!videoId) {
    return (
      <PageShell title="Recréer une vidéo">
        <div className="rounded-xl border border-dashed border-black/15 bg-white p-10 text-center">
          <Film className="mx-auto h-8 w-8 text-black/25" />
          <p className="mt-3 text-sm text-black/50">Choisissez d'abord une vidéo virale dans la bibliothèque.</p>
          <Link to="/videos" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-black underline">
            <ArrowLeft className="h-4 w-4" /> Aller à la bibliothèque
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Recréer avec mon influenceur"
      subtitle="Le mouvement, le cadrage et le rythme de la vidéo source sont conservés ; votre influenceur remplace le personnage."
      actions={<Link to="/videos" className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black"><ArrowLeft className="h-4 w-4" /> Retour</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Côte à côte */}
        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="border-b border-black/10 px-3 py-2 text-xs font-medium text-black/60">Référence</div>
            <div className="relative aspect-[9/16] bg-black/5">
              {video?.thumbnail_url ? (
                <SignedImage src={video.thumbnail_url} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center"><Film className="h-8 w-8 text-black/20" /></div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-xs font-medium">{video?.title}</p>
              <p className="mt-1 text-[11px] text-black/40">{video?.platform} · {video?.category}</p>
              {hasSourceVideo ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-green-700"><FileVideo className="h-3 w-3" /> Vidéo source prête</p>
              ) : (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700"><AlertTriangle className="h-3 w-3" /> Vidéo source manquante</p>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="border-b border-black/10 px-3 py-2 text-xs font-medium text-black/60">Mon influenceur</div>
            <div className="relative aspect-[9/16] bg-black/5">
              {selectedInfluencer?.reference_image ? (
                <SignedImage src={selectedInfluencer.reference_image} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-black/20" /></div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium">{selectedInfluencer?.name || "Aucun sélectionné"}</p>
            </div>
          </div>
        </div>

        {/* Réglages */}
        <div className="space-y-5">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <Label className="text-xs">Choisir un influenceur</Label>
            {influencers.length === 0 ? (
              <p className="mt-2 text-xs text-black/50">Aucun influenceur. <Link to="/influenceurs" className="underline">Créez-en un</Link>.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {influencers.map((inf) => (
                  <button
                    key={inf.id}
                    onClick={() => { setActiveId(inf.id); localStorage.setItem("influenceia.activeInfluencer", inf.id); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${activeId === inf.id ? "border-black bg-black text-white" : "border-black/15 text-black/70 hover:bg-black/5"}`}
                  >
                    {inf.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* État de la connexion */}
          {connection && (
            <div className={`flex items-start gap-2.5 rounded-lg border p-3 ${connection.connected ? "border-blue-200 bg-blue-50/60" : "border-amber-200 bg-amber-50/70"}`}>
              {connection.connected ? (
                <Info className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
              )}
              <p className={`text-xs leading-relaxed ${connection.connected ? "text-blue-800" : "text-amber-900"}`}>
                {connection.connected ? (
                  "Transfert de mouvement actif : la vidéo source sera utilisée pour le mouvement et le cadrage."
                ) : (
                  <>Higgsfield n'est pas encore connecté. Ajoutez vos identifiants API dans <Link to="/connexion" className="underline">Connexion Higgsfield</Link>.</>
                )}
              </p>
            </div>
          )}

          {/* Référence sans vidéo source */}
          {video && !hasSourceVideo && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-red-600" />
              <p className="text-xs leading-relaxed text-red-800">
                Cette référence ne contient que son lien de publication. Le transfert de mouvement a besoin du fichier vidéo (mp4, 4 à 30 s) : ajoutez-le depuis <Link to="/videos" className="underline">la bibliothèque</Link>.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Direction visuelle</h3>
            <div className="mt-3">
              <Label className="text-xs">Résolution</Label>
              <Select value={form.resolution} onValueChange={(v) => setForm((s) => ({ ...s, resolution: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{RESOLUTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-black/45">La durée et le format suivent la vidéo source : ils ne se règlent pas séparément.</p>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs">Tenue</Label>
                <Input value={form.wardrobe} onChange={(e) => setForm((s) => ({ ...s, wardrobe: e.target.value }))} placeholder="Ex. jean et t-shirt blanc" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Décor</Label>
                <Input value={form.setting} onChange={(e) => setForm((s) => ({ ...s, setting: e.target.value }))} placeholder="Ex. rue de ville au coucher du soleil" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Instructions complémentaires</Label>
                <Textarea value={form.instructions} onChange={(e) => setForm((s) => ({ ...s, instructions: e.target.value }))} placeholder="Mouvement, ambiance, détails…" rows={3} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/55">
              <span>Moteur : <strong>transfert de mouvement</strong></span>
              <span>Résolution : <strong>{form.resolution}</strong></span>
              <span>Influenceur : <strong>{selectedInfluencer?.name || "à choisir"}</strong></span>
            </div>
            <p className="mt-2 text-[11px] text-black/40">Higgsfield facture à la seconde selon la résolution. La musique originale n'est pas réutilisée automatiquement.</p>
            <Button
              onClick={launch}
              disabled={launching || !selectedInfluencer || !hasSourceVideo || !connection?.connected}
              className="mt-4 w-full bg-black text-white hover:bg-black/85"
            >
              {launching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {launching ? "Lancement…" : "Lancer la génération"}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}