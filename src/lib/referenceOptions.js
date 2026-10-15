export const PLATFORMS = ["tiktok", "instagram", "youtube"];

export const CATEGORIES = ["danse", "lifestyle", "humour", "beaute", "fitness", "mode", "food", "voyage", "tech"];

export function platformLabel(p) {
  const map = { tiktok: "TikTok", instagram: "Reels", youtube: "Shorts" };
  return map[p] || p;
}