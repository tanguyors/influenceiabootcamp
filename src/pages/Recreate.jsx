import { useEffect, useRef, useState } from "react";
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

export default function Recreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const videoId = params.get("video");

  const [video, setVideo] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("influenceia.activeInfluencer") || "");
  const [launching, setLaunching] = useState(false);
  const [tools, setTools] = useState(null);
  const [connected, setConnected] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sourceStatus, setSourceStatus] = useState("idle");
  const [sourceError, setSourceError] = useState("");
  const fetchedFor = useRef("");
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
      else if (videoId) setVideo(findDemoVideo(videoId));
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
  const needsSourceFile = Boolean(video?.id && !hasSourceVideo && ["tiktok", "instagram"].includes(video?.platform));

  // Sans le fichier source, Higgsfield ne peut pas reprendre le mouvement de la référence : on le récupère d'abord.
  async function fetchSource() {
    setSourceStatus("fetching");
    setSourceError("");
    try {
      const res = await base44.functions.invoke("viralScraper", { action: "fetchSource", viral_video_id: video.id });
      const data = res.data || {};
      if (data.error) throw new Error(data.error);
      setVideo((v) => ({ ...v, video_file_uri: data.video_file_uri, duration: data.duration || v.duration }));
      setSourceStatus("ready");
      toast({ title: "Vidéo source récupérée", description: "Le mouvement de la référence sera repris à l'identique." });
    } catch (e) {
      setSourceError(e?.response?.data?.error || e.message);
      setSourceStatus("error");
    }
  }

  useEffect(() => {
    if (!needsSourceFile || !video?.id) return;
    if (fetchedFor.current === video.id) return;
    fetchedFor.current = video.id;
    fetchSource();
  }, [needsSourceFile, video?.id]);

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
      subtitle="Reprenez la direction visuelle de la référence avec votre personnage. Le résultat est une adaptation, non une reproduction fidèle des mouvements, selon les capacités du modèle."
      actions={<Link to="/videos" className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black"><ArrowLeft className="h-4 w-4" /> Retour</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Side by side */}
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
              {sourceStatus === "fetching" ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-black/50">
                  <Loader2 className="h-3 w-3 animate-spin" /> Récupération de la vidéo source…
                </p>
              ) : hasSourceVideo ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-green-700"><FileVideo className="h-3 w-3" /> Vidéo source jointe</p>
              ) : sourceStatus === "error" ? (
                <div className="mt-1.5">
                  <p className="text-[11px] leading-relaxed text-amber-700">Vidéo source indisponible : {sourceError}</p>
                  <button onClick={fetchSource} className="mt-1 text-[11px] font-medium text-black underline">Réessayer</button>
                </div>
              ) : null}
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

        {/* Controls */}
        <div className="space-y-5">
          {/* Influencer picker */}
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

          {/* Connexion Higgsfield */}
          {connected === false && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-900">
                Compte Higgsfield non connecté. Connectez-le depuis <Link to="/connexion" className="underline">Connexion Higgsfield</Link> pour pouvoir générer.
              </p>
            </div>
          )}

          {/* Crédits Higgsfield */}
          {connected && credits === 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-900">
                Votre compte Higgsfield n'a aucun crédit : la génération échouera. Rechargez votre compte Higgsfield, puis relancez.
              </p>
            </div>
          )}

          {/* Capability notice */}
          {tools !== null && connected && (
            <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
              <Info className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
              <p className="text-xs leading-relaxed text-blue-800">
                {hasReferenceTransfer
                  ? "Transfert de mouvement / référence détecté : la référence sera utilisée pour le cadrage et le rythme."
                  : "Aucun outil de transfert de mouvement détecté. La génération se fera à partir de l'image et du texte : le résultat sera une adaptation, pas une reproduction des mouvements."}
              </p>
            </div>
          )}

          {/* Params */}
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <h3 className="font-heading text-sm font-semibold tracking-tight">Direction visuelle</h3>
            <p className="mt-1 text-[11px] text-black/45">
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
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/55">
              <span>Modèle : <strong>automatique</strong></span>
              <span>Mode : <strong>{hasSourceVideo ? "mouvement de la référence repris" : "adaptation sans fichier source"}</strong></span>
              <span>Durée : <strong>identique à la vidéo d'origine</strong></span>
              <span>Format : <strong>{form.aspect_ratio}</strong></span>
              <span>Résolution : <strong>{form.resolution}</strong></span>
            </div>
            <p className="mt-2 text-[11px] text-black/40">Le 1080p natif est privilégié ; une mise à l'échelle sera signalée si le modèle ne le permet pas. La musique originale n'est pas réutilisée automatiquement.</p>
            <Button
              onClick={launch}
              disabled={launching || !selectedInfluencer || connected === false || sourceStatus === "fetching"}
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