// Prompts prêts à copier dans le chat Base44 : une seule source pour toute l'app, en FR et EN.
export const PROMPT_GROUPS = {
  fr: [
    {
      id: "buzz",
      title: "Le plus puissant : ton cerveau Base44 repère ce qui buzz en ce moment",
      intro:
        "Demande-lui de trouver les vidéos qui font le buzz aujourd'hui, puis colle le lien ici : le modèle rejoint ta banque et ton stock grandit à chaque trouvaille.",
      prompts: [
        "Trouve 5 vidéos qui font le buzz aujourd'hui sur TikTok dans la niche de mon influenceur, avec les liens.",
        "Cherche les formats vidéo qui cartonnent en ce moment dans ma niche et donne-moi les liens directs.",
        "Donne-moi 3 vidéos virales récentes de moins de 15 secondes que je peux recréer avec mon personnage, liens inclus.",
      ],
    },
    {
      id: "textes",
      title: "Écrire accroche, légende et hashtags",
      intro:
        "L'IA regarde ta vidéo et écrit les textes à ta place : aucun champ à remplir, tu copies-colles ensuite.",
      prompts: [
        "Regarde ma dernière vidéo générée et écris-moi 3 accroches courtes.",
        "Écris la légende et les hashtags pour ma dernière création, ton cool et direct.",
        "Propose 3 accroches différentes pour ma création prête, orientées scroll-stopping.",
      ],
    },
    {
      id: "bio",
      title: "Écrire les bios de tes personnages",
      intro: "Une bio par personnage, dans son ton et sa niche, générée directement depuis le chat.",
      prompts: [
        "Écris la bio Instagram de mon influenceur en 3 lignes, ton direct et drôle.",
        "Réécris la bio de mon personnage en 3 lignes plus punchy, sans cliché.",
        "Écris une bio TikTok et une bio Instagram pour mon influenceur, avec la même identité.",
      ],
    },
    {
      id: "planning",
      title: "Planifier les publications",
      intro: "Demande ton planning : l'IA remplit ton calendrier et te dit quand publier, tu valides.",
      prompts: [
        "Remplis mon calendrier avec 5 publications dans les 7 prochains jours, à partir de mes vidéos prêtes.",
        "Quels sont les meilleurs jours et heures pour poster cette semaine dans ma niche ?",
        "Programme ma dernière création sur TikTok jeudi à 19h, avec le texte prêt à publier.",
      ],
    },
  ],
  en: [
    {
      id: "buzz",
      title: "The strongest one: your Base44 brain spots what is trending right now",
      intro:
        "Ask it to find the videos that are blowing up today, then paste the link here: the model joins your library and your stock grows with every find.",
      prompts: [
        "Find 5 videos trending on TikTok today in my influencer's niche, with the links.",
        "Look for the video formats that are performing right now in my niche and give me the direct links.",
        "Give me 3 recent viral videos under 15 seconds that I can recreate with my character, links included.",
      ],
    },
    {
      id: "textes",
      title: "Write the hook, caption and hashtags",
      intro:
        "The AI watches your video and writes the texts for you: no field to fill in, you just copy and paste.",
      prompts: [
        "Watch my latest generated video and write me 3 short hooks.",
        "Write the caption and the hashtags for my latest creation, cool and direct tone.",
        "Suggest 3 different hooks for my ready creation, aimed at stopping the scroll.",
      ],
    },
    {
      id: "bio",
      title: "Write the bios for your characters",
      intro: "One bio per character, in its tone and niche, generated straight from the chat.",
      prompts: [
        "Write my influencer's Instagram bio in 3 lines, direct and funny.",
        "Rewrite my character's bio in 3 punchier lines, without clichés.",
        "Write a TikTok bio and an Instagram bio for my influencer, with the same identity.",
      ],
    },
    {
      id: "planning",
      title: "Plan your posts",
      intro: "Ask for your schedule: the AI fills your calendar and tells you when to post, you approve.",
      prompts: [
        "Fill my calendar with 5 posts over the next 7 days, from my ready videos.",
        "What are the best days and times to post this week in my niche?",
        "Schedule my latest creation on TikTok on Thursday at 7pm, with the text ready to publish.",
      ],
    },
  ],
};

export function promptGroups(lang) {
  return PROMPT_GROUPS[lang] || PROMPT_GROUPS.fr;
}

export function promptGroup(id, lang) {
  const groups = promptGroups(lang);
  return groups.find((group) => group.id === id) || groups[0];
}

export function allPrompts(lang) {
  return promptGroups(lang).flatMap((group) => group.prompts);
}