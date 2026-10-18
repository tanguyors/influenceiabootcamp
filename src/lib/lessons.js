// Contenu des leçons de la page Ressources. Chaque leçon est écrite en français et en anglais,
// phrase pour phrase : la procédure doit se lire exactement pareil dans les deux langues.
export const LESSONS = [
  {
    id: "lancement-tiktok-7-jours",
    code: "01",
    fr: {
      title: "Lancement TikTok en 7 jours",
      lead: "Ce document décrit ce qu'il faut faire, jour par jour, pour lancer un compte TikTok de promotion. Chaque étape a sa raison d'être : ne pas en avancer une, ne pas en sauter une.",
      redNote: "Les points en rouge sont ceux qui font bannir un compte quand on ne les respecte pas.",
      tag: "7 jours",
      excerpt: "La procédure complète, jour par jour, pour lancer un compte TikTok de promotion sans le faire bannir.",
      setupTitle: "Avant de créer le moindre compte",
      setup: [
        {
          text: "Le téléphone doit être réglé sur les États-Unis.",
          detail: "Dans les réglages du téléphone : la localisation, la date et l'heure. C'est ce qui indique à TikTok à quelle audience montrer le compte. Un compte destiné aux Américains depuis un téléphone réglé sur l'Europe ne sera pas distribué au bon endroit.",
        },
        { text: "Deux comptes par téléphone, jamais plus.", danger: true },
        {
          text: "Un seul compte créé toutes les 24 heures.",
          danger: true,
          detail: "Même si plusieurs téléphones sont prêts, on n'en lance qu'un par jour. Créer plusieurs comptes d'affilée est le signal le plus facile à repérer.",
        },
      ],
      weekTitle: "Les sept premiers jours",
      days: [
        {
          label: "Jour 1",
          title: "Créer le compte, et rien d'autre",
          body: ["Tu crées le compte, puis tu le laisses tranquille. Pas de photo, pas de bio, pas de scroll, pas un seul like. Rien du tout pendant 24 heures."],
        },
        {
          label: "Jours 2 à 4",
          title: "Le rodage",
          body: [
            "15 à 30 minutes par jour, pas plus, pas moins.",
            "Tu regardes, tu likes et tu commentes du contenu de la niche : modèles OnlyFans, audience américaine. C'est ce qui apprend à TikTok à qui montrer le compte plus tard.",
            "Pendant ces trois jours : toujours pas de photo de profil, pas de bio, aucune publication.",
          ],
        },
        {
          label: "Jours 5 et 6",
          title: "Rodage, puis identité du compte",
          body: [
            "Tu continues le rodage quotidien, toujours 15 à 30 minutes sur la même niche.",
            "Tu ajoutes maintenant la photo de profil et la bio.",
            "La bio doit être différente sur chaque compte, mais elle a toujours le même but : faire comprendre aux gens qu'ils doivent regarder la story à la une, juste en dessous.",
          ],
          examples: ["in story⬇️", "look the story👇🏼"],
          examplesNote: "Deux exemples. Écris-en une nouvelle à chaque compte, en gardant cette intention.",
        },
        {
          label: "Jour 7",
          title: "La story à la une, puis le premier TikTok",
          body: ["Tu mets en avant la story de la modèle, avec un texte qui renvoie vers le Telegram."],
          danger: {
            text: "N'écris jamais le mot « telegram ». Toujours « TLG ».",
            detail: "TikTok bannit le compte immédiatement s'il détecte le mot complet. Cette règle vaut partout : bio, story, commentaires, légendes.",
          },
          examples: ["DM me on TLG👀 : lily_juicy", "send me a message on TLG🤭 : lily_juicy"],
          examplesNote: "Remplace le pseudo par celui du Telegram de la modèle.",
          body2: ["Une fois la story en place, tu publies le premier TikTok."],
        },
      ],
      routineTitle: "La routine quotidienne, à partir du jour 7",
      routineLead: "Le compte est lancé. À partir de là, c'est cette routine qui le fait grandir, tous les jours.",
      routine: [
        {
          text: "Deux TikToks par jour, aux heures américaines.",
          detail: "Un le matin et un le soir, ou un l'après-midi et un le soir. Toujours en heure US.",
        },
        {
          text: "Avant chaque publication : scroller un peu et liker.",
          detail: "Même au bout d'une semaine, même au bout d'un mois. On n'ouvre jamais l'application pour publier directement.",
        },
        {
          text: "Après chaque publication : rester 10 minutes minimum sur l'application.",
          detail: "Tu continues d'interagir avec le même contenu que le nôtre, la niche modèles OnlyFans. TikTok favorise les comptes qui restent sur l'application après avoir publié.",
        },
        {
          text: "Répondre à tous les commentaires, sans exception.",
          detail: "C'est ce qui pèse le plus sur la distribution. Plus il y a de réponses, plus la vidéo est montrée.",
        },
        {
          text: "Une story par jour de la modèle.",
          detail: "Toujours le même genre de phrase, toujours avec « TLG », pour ramener le trafic sur le Telegram. C'est la raison d'être de la story : si un TikTok perce, beaucoup de monde la verra, et donc beaucoup de monde arrivera sur le Telegram.",
        },
      ],
      neverTitle: "Ce qu'il ne faut jamais faire",
      never: [
        "Ne jamais écrire le mot « telegram ». Toujours « TLG », partout.",
        "Ne jamais supprimer une vidéo. Si une vidéo pose problème, la passer en privé — mais elle reste sur le compte.",
        "Ne jamais publier avant le jour 7.",
        "Jamais plus de deux comptes sur un même téléphone.",
        "Jamais plus d'un compte créé par tranche de 24 heures.",
      ],
      summaryTitle: "Aide-mémoire",
      summaryHead: ["Jour", "Ce que tu fais"],
      summary: [
        ["Jour 1", "Créer le compte. Rien d'autre."],
        ["Jours 2–4", "Rodage 15 à 30 min : regarder, liker, commenter la niche, audience US."],
        ["Jours 5–6", "Rodage. Ajouter la photo de profil et la bio qui renvoie à la story."],
        ["Jour 7", "Story à la une avec « TLG ». Premier TikTok."],
        ["Ensuite", "2 TikToks par jour en heures US, 1 story, répondre à tous les commentaires. Scroller avant, rester 10 min après."],
      ],
    },
    en: {
      title: "TikTok launch in 7 days",
      lead: "This document describes what to do, day by day, to launch a TikTok promotion account. Every step has its reason: do not move ahead on one, do not skip one.",
      redNote: "The points in red are the ones that get an account banned when they are not respected.",
      tag: "7 days",
      excerpt: "The full procedure, day by day, to launch a TikTok promotion account without getting it banned.",
      setupTitle: "Before creating any account",
      setup: [
        {
          text: "The phone must be set to the United States.",
          detail: "In the phone's settings: location, date and time. That is what tells TikTok which audience to show the account to. An account meant for Americans from a phone set to Europe will not be distributed in the right place.",
        },
        { text: "Two accounts per phone, never more.", danger: true },
        {
          text: "One account created every 24 hours.",
          danger: true,
          detail: "Even if several phones are ready, only one is launched per day. Creating several accounts in a row is the easiest signal to spot.",
        },
      ],
      weekTitle: "The first seven days",
      days: [
        {
          label: "Day 1",
          title: "Create the account, and nothing else",
          body: ["You create the account, then you leave it alone. No photo, no bio, no scrolling, not a single like. Nothing at all for 24 hours."],
        },
        {
          label: "Days 2 to 4",
          title: "The warm-up",
          body: [
            "15 to 30 minutes a day, no more, no less.",
            "You watch, like and comment on content in the niche: OnlyFans models, American audience. That is what teaches TikTok who to show the account to later.",
            "During those three days: still no profile photo, no bio, no post.",
          ],
        },
        {
          label: "Days 5 and 6",
          title: "Warm-up, then the account identity",
          body: [
            "You keep the daily warm-up, still 15 to 30 minutes on the same niche.",
            "You now add the profile photo and the bio.",
            "The bio must be different on every account, but it always has the same purpose: make people understand that they should watch the story highlight, just below.",
          ],
          examples: ["in story⬇️", "look the story👇🏼"],
          examplesNote: "Two examples. Write a new one for every account, keeping that intention.",
        },
        {
          label: "Day 7",
          title: "The story highlight, then the first TikTok",
          body: ["You highlight the model's story, with a text that sends people to Telegram."],
          danger: {
            text: "Never write the word “telegram”. Always “TLG”.",
            detail: "TikTok bans the account immediately if it detects the full word. This rule applies everywhere: bio, story, comments, captions.",
          },
          examples: ["DM me on TLG👀 : lily_juicy", "send me a message on TLG🤭 : lily_juicy"],
          examplesNote: "Replace the handle with the model's Telegram handle.",
          body2: ["Once the story is in place, you publish the first TikTok."],
        },
      ],
      routineTitle: "The daily routine, from day 7 on",
      routineLead: "The account is launched. From there on, this routine is what makes it grow, every day.",
      routine: [
        {
          text: "Two TikToks a day, in American hours.",
          detail: "One in the morning and one in the evening, or one in the afternoon and one in the evening. Always US time.",
        },
        {
          text: "Before every post: scroll a little and like.",
          detail: "Even after a week, even after a month. You never open the app just to post.",
        },
        {
          text: "After every post: stay at least 10 minutes on the app.",
          detail: "You keep interacting with the same content as ours, the OnlyFans models niche. TikTok favours accounts that stay on the app after posting.",
        },
        {
          text: "Reply to every comment, without exception.",
          detail: "That is what weighs most on distribution. The more replies there are, the more the video is shown.",
        },
        {
          text: "One story a day from the model.",
          detail: "Always the same kind of sentence, always with “TLG”, to bring the traffic back to Telegram. That is the whole point of the story: if a TikTok breaks through, many people will see it, and so many people will reach Telegram.",
        },
      ],
      neverTitle: "What you must never do",
      never: [
        "Never write the word “telegram”. Always “TLG”, everywhere.",
        "Never delete a video. If a video is a problem, set it to private — but it stays on the account.",
        "Never post before day 7.",
        "Never more than two accounts on the same phone.",
        "Never more than one account created per 24-hour period.",
      ],
      summaryTitle: "Cheat sheet",
      summaryHead: ["Day", "What you do"],
      summary: [
        ["Day 1", "Create the account. Nothing else."],
        ["Days 2–4", "Warm-up 15 to 30 min: watch, like, comment in the niche, US audience."],
        ["Days 5–6", "Warm-up. Add the profile photo and the bio pointing to the story."],
        ["Day 7", "Story highlight with “TLG”. First TikTok."],
        ["Afterwards", "2 TikToks a day in US hours, 1 story, reply to every comment. Scroll before, stay 10 min after."],
      ],
    },
  },
];

export function getLesson(id) {
  return LESSONS.find((lesson) => lesson.id === id) || LESSONS[0];
}

export function lessonContent(lesson, lang) {
  return lesson[lang] || lesson.fr;
}