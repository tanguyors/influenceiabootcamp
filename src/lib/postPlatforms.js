import { Instagram, Music2, Youtube } from "lucide-react";

// Réseaux proposés pour la programmation des posts (mêmes identifiants que ViralVideo.platform).
export const POST_PLATFORMS = [
  { id: "tiktok", label: "TikTok", Icon: Music2 },
  { id: "instagram", label: "Instagram", Icon: Instagram },
  { id: "youtube", label: "YouTube", Icon: Youtube },
];

export function platformOf(id) {
  return POST_PLATFORMS.find((platform) => platform.id === id) || POST_PLATFORMS[0];
}