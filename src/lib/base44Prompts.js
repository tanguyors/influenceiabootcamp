// Prompts prêts à copier dans le chat Base44 : une seule source pour toute l'app.
export const PROMPT_GROUPS = [
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
    intro:
      "Une bio par personnage, dans son ton et sa niche, générée directement depuis le chat.",
    prompts: [
      "Écris la bio Instagram de mon influenceur en 3 lignes, ton direct et drôle.",
      "Réécris la bio de mon personnage en 3 lignes plus punchy, sans cliché.",
      "Écris une bio TikTok et une bio Instagram pour mon influenceur, avec la même identité.",
    ],
  },
  {
    id: "planning",
    title: "Planifier les publications",
    intro:
      "Demande ton planning : l'IA remplit ton calendrier et te dit quand publier, tu valides.",
    prompts: [
      "Remplis mon calendrier avec 5 publications dans les 7 prochains jours, à partir de mes vidéos prêtes.",
      "Quels sont les meilleurs jours et heures pour poster cette semaine dans ma niche ?",
      "Programme ma dernière création sur TikTok jeudi à 19h, avec le texte prêt à publier.",
    ],
  },
];

export const ALL_PROMPTS = PROMPT_GROUPS.flatMap((group) => group.prompts);

export function promptGroup(id) {
  return PROMPT_GROUPS.find((group) => group.id === id) || PROMPT_GROUPS[0];
}