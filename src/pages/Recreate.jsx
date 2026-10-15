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

export default function Recreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const videoId = params.get("video");

  const [video, setVideo] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("influenceia.activeInfluencer") || "");
  const [launching, setLaunching] = useState(false);
  const [launchLabel, setLaunchLabel] = useState("");
  const [tools, setTools] = useState(null);
  const [connected, setConnected] = useState(null);
  const [credits, setCredits] = useState(null);
  const [form, setForm] = useState({
    aspect_ratio: "9:16",
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
    } catch (e) {
      /* entities may not exist yet */
    }
    try {
      const res = await base44.functions.invoke("higgsfieldGateway", { action: "status" });
      const data = res.data || {};
      setTools(data.tools || []);
      setConnected(Boolean(data.connected));
      setCredits(data.balance ? Number(data.balance.credits) : null);
    } catch (e) {
      setTools([]);
      setConnected(false);
    }
  }
  useEffect(() => { loadAll(); }, [videoId]);

  const selectedInfluencer = influencers.find((i) => i.id === activeId);
  const hasReferenceTransfer = tools?.some((t) => /reference|motion|transfer|control|character/i.test(t.name + " " + (t.description || "")));
  const hasSourceVideo = Boolean(video?.video_file_uri);
  const motionReference = selectedInfluencer?.motion_reference_source === selectedInfluencer?.reference_image
    ? selectedInfluencer?.motion_reference_image : "";

  async function launch() {
    if (!selectedInfluencer) {
      toast({ title: "Sélectionnez un influenceur", variant: "destructive" });
      return;
    }
    if (!video) {
      toast({ title: "Vidéo de référence introuvable", variant: "destructive" });
      return;
    }
    setLaunching(true);
    try {
      if (hasSourceVideo) {
        setLaunchLabel("Préparation de la photo…");
        const { data } = await base44.functions.invoke("generateVideo", {
          action: "prepare_reference",
          influencer_id: selectedInfluencer.id,
        });
        if (data.error) throw new Error(data.error);
        setInfluencers((items) => items.map((item) => item.id === selectedInfluencer.id
          ? { ...item, motion_reference_image: data.reference_image, motion_reference_source: data.source }
          : item));
      }
      setLaunchLabel("Lancement…");
      await base44.functions.invoke("generateVideo", {
        influencer_id: selectedInfluencer.id,
        viral_video_id: video.id,
        aspect_ratio: form.aspect_ratio,
        resolution: form.resolution,
        wardrobe: form.wardrobe.trim(),
        setting: form.setting.trim(),
        instructions: form.instructions.trim(),
      });
      toast({ title: "Génération lancée", description: "Suivez l'état dans Mes créations." });
      navigate("/creations");
    } catch (e) {
      // Affiche la raison envoyée par le serveur, pas le seul code HTTP.
      const detail = e?.response?.data?.error || e?.response?.data?.message || e.message;
      toast({ title: "Lancement impossible", description: detail, variant: "destructive" });
    } finally {
      setLaunching(false);
    }
  }

  if (!videoId) {
    return (
      <PageShell title="Recréer une vidéo">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Film className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">Choisissez d'abord un modèle dans votre banque.</p>
          <Link to="/videos" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline">
            <ArrowLeft className="h-4 w-4" /> Aller à la banque de modèles
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Recréer avec mon influenceur"
      subtitle="Votre personnage remplace la personne de la vidéo : le cadre, la caméra et le mouvement de l'original sont repris. Le rendu reste une adaptation, selon les capacités du modèle."
      actions={<Link to="/videos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">Référence</div>
            <div className="relative aspect-[9/16] bg-secondary">
              {video?.thumbnail_url ? (
                <SignedImage src={video.thumbnail_url} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center"><Film className="h-8 w-8 text-muted-foreground/50" /></div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-xs font-medium">{video?.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{video?.platform} · {video?.category}</p>
              {hasSourceVideo ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary"><FileVideo className="h-3 w-3" /> Vidéo source jointe</p>
              ) : (
                <p className="mt-1.5 text-[11px] leading-relaxed text-amber-300">
                  Ce modèle n'a pas de fichier mp4 : ajoutez-le depuis <Link to="/videos" className="underline">la banque de modèles</Link> pour que le mouvement soit repris. Sinon, le résultat sera une adaptation.
                </p>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">Mon influenceur</div>
            <div className="relative aspect-[9/16] bg-secondary">
              {selectedInfluencer?.reference_image ? (
                <SignedImage src={(hasSourceVideo && motionReference) || selectedInfluencer.reference_image} fittingType="fit" className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground/50" /></div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium">{selectedInfluencer?.name || "Aucun sélectionné"}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Influencer picker */}
          <div className="rounded-xl border border-border bg-card p-4">
            <Label className="text-xs">Choisir un influenceur</Label>
            {influencers.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Aucun influenceur. <Link to="/influenceurs" className="underline">Créez-en un</Link>.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {influencers.map((inf) => (
                  <button
                    key={inf.id}
                    onClick={() => { setActiveId(inf.id); localStorage.setItem("influenceia.activeInfluencer", inf.id); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${activeId === inf.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    {inf.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connexion Higgsfield */}
          {connected === false && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                Compte Higgsfield non connecté. Connectez-le depuis <Link to="/connexion" className="underline">Connexion Higgsfield</Link> pour pouvoir générer.
              </p>
            </div>
          )}

          {/* Crédits Higgsfield */}
          {connected && credits === 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                Votre compte Higgsfield n'a aucun crédit : la génération échouera. Rechargez votre compte Higgsfield, puis relancez.
              </p>
            </div>
          )}

          {/* Capability notice */}
          {tools !== null && connected && (
            <div className="flex items-start gap-2.5 rounded-lg border border-sky-500/25 bg-sky-500/10 p-3">
              <Info className="mt-0.5 h-4 w-4 flex-none text-sky-400" />
              <p className="text-xs leading-relaxed text-sky-200/90">
                {hasReferenceTransfer
                  ? "Transfert de mouvement / référence détecté : la référence sera utilisée pour le cadrage et le rythme."
                  : "Aucun outil de transfert de mouvement détecté. La génération se fera à partir de l'image et du texte : le résultat sera une adaptation, pas une reproduction des mouvements."}
              </p>
            </div>
          )}

          {/* Params */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Direction visuelle</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Le modèle et la durée sont gérés automatiquement : la durée est exactement celle de la vidéo d'origine.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Format</Label>
                <Select value={form.aspect_ratio} onValueChange={(v) => setForm((s) => ({ ...s, aspect_ratio: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["9:16", "1:1", "4:5", "16:9"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Résolution</Label>
                <Select value={form.resolution} onValueChange={(v) => setForm((s) => ({ ...s, resolution: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["1080p", "720p", "4k"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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

          {/* Summary + launch */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Modèle : <strong className="text-foreground">automatique</strong></span>
              <span>Mode : <strong className="text-foreground">{hasSourceVideo ? "cadre et mouvement de l'original, votre personnage à la place de la personne" : "adaptation sans fichier source"}</strong></span>
              <span>Durée : <strong className="text-foreground">identique à la vidéo d'origine</strong></span>
              <span>Format : <strong className="text-foreground">{form.aspect_ratio}</strong></span>
              <span>Résolution : <strong className="text-foreground">{form.resolution}</strong></span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/80">Le 1080p natif est privilégié ; une mise à l'échelle sera signalée si le modèle ne le permet pas. La musique originale n'est pas réutilisée automatiquement.</p>
            {hasSourceVideo && <p className="mt-2 text-[11px] text-muted-foreground">Le cadrage de la photo est vérifié avant l'envoi. Si nécessaire, OpenAI prépare une photo plein pied, conservée pour les prochains transferts.</p>}
            <Button
              onClick={launch}
              disabled={launching || !selectedInfluencer || connected === false}
              className="mt-4 w-full font-semibold"
            >
              {launching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {launching ? launchLabel || "Lancement…" : "Lancer la génération"}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}