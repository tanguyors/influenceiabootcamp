// Données de démonstration clairement signalées — aucune statistique réelle, aucune connexion réseau inventée.
export const DEMO_VIDEOS = [
  { id: "demo-1", title: "Transition tenue robe de soirée", platform: "tiktok", source_url: "https://www.tiktok.com", category: "mode", thumbnail_url: "", published_date: "2026-10-14T12:00:00Z", stats: { views: null, likes: null }, is_demo: true },
  { id: "demo-2", title: "Routine skincare du matin", platform: "instagram", source_url: "https://www.instagram.com", category: "beaute", thumbnail_url: "", published_date: "2026-10-14T08:00:00Z", stats: { views: null, likes: null }, is_demo: true },
  { id: "demo-3", title: "Chorégraphie tendance 15s", platform: "tiktok", source_url: "https://www.tiktok.com", category: "danse", thumbnail_url: "", published_date: "2026-10-13T20:00:00Z", stats: { views: null, likes: null }, is_demo: true },
  { id: "demo-4", title: "Full body workout sans matériel", platform: "youtube", source_url: "https://www.youtube.com", category: "fitness", thumbnail_url: "", published_date: "2026-10-13T10:00:00Z", stats: { views: null, likes: null }, is_demo: true },
];

export function findDemoVideo(id) {
  return DEMO_VIDEOS.find((v) => v.id === id) || null;
}