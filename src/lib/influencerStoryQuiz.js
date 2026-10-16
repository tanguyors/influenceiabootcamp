// Petit questionnaire posé après l'import d'un influenceur : ses réponses servent de brief
// à la génération de son histoire. Seule la niche est obligatoire, le reste affine le récit.
export const storyQuizQuestions = [
  {
    id: "niche",
    label: "Sa niche principale",
    hint: "Le sujet dont il ou elle parle en priorité.",
    required: true,
    options: [
      "Beauté",
      "Mode & style",
      "Fitness & sport",
      "Food",
      "Voyage",
      "Tech & gaming",
      "Humour",
      "Business & argent",
      "Lifestyle & vlog",
    ],
  },
  {
    id: "platform",
    label: "Où il ou elle publie",
    options: ["TikTok", "Instagram", "YouTube", "X (Twitter)", "LinkedIn"],
  },
  {
    id: "audience",
    label: "Son public",
    options: ["Ados (13-19)", "Jeunes adultes (20-29)", "Adultes (30-45)", "Familles", "Professionnels"],
  },
  {
    id: "tone",
    label: "Son ton",
    options: ["Drôle et décalé", "Chaleureux et sincère", "Premium et élégant", "Énergique et motivant", "Mystérieux et cash"],
  },
  {
    id: "personality",
    label: "Sa personnalité",
    hint: "Plusieurs choix possibles.",
    multi: true,
    options: [
      "Ambitieuse",
      "Spontanée",
      "Bienveillante",
      "Rebelle",
      "Intello",
      "Sportive",
      "Gourmande",
      "Globe-trotteuse",
      "Geek",
      "Fashionista",
    ],
  },
];