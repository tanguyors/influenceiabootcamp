import { base44 } from "@/api/base44Client";

const OPTION_COUNT = 9;
const CONCURRENCY = 3;

// Une requête et une identité par portrait, sans dépasser trois générations simultanées.
export default async function requestCharacterOptions(payload) {
  const results = [];
  for (let start = 0; start < OPTION_COUNT; start += CONCURRENCY) {
    const batch = await Promise.allSettled(
      Array.from({ length: Math.min(CONCURRENCY, OPTION_COUNT - start) }, async (_, offset) => {
        const { data } = await base44.functions.invoke("generateInfluencerGpt", {
          ...payload,
          mode: "options",
          variant: start + offset,
        });
        if (data?.error) throw new Error(data.error);
        if (data?.images?.length !== 1) throw new Error("Aucun portrait individuel renvoyé par OpenAI.");
        return data.images[0];
      })
    );
    results.push(...batch);
    if (batch.every((result) => result.status === "rejected")) break;
  }
  const images = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
  const failure = results.find((result) => result.status === "rejected");
  const reason = failure?.reason;
  const message = reason?.response?.data?.error || reason?.message || "Génération interrompue.";
  if (!images.length) throw new Error(message);
  return {
    images,
    error: images.length < OPTION_COUNT
      ? `${images.length} portraits sur ${OPTION_COUNT} ont pu être générés. Les portraits disponibles restent sélectionnables. ${message}`
      : "",
  };
}