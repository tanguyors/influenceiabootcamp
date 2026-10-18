// Prompt maître : à coller dans le chat Base44 pour recréer cette application à l'identique (design + fonctionnalités).
export const MASTER_PROMPT = {
  fr: `Construis une application web nommée « InfluenceIA » : un studio pour créer des influenceurs IA et générer, à partir de vidéos virales, leurs propres vidéos. Reproduis exactement le design, les écrans et les fonctionnalités décrits ci-dessous. Ne simplifie rien, ne remplace aucun écran par une version réduite, n'ajoute rien d'autre.

1. DESIGN (strictement identique)
- Thème sombre uniquement : fond #080808, cartes #121212, bordures #262626, texte principal #f5f5f2, texte secondaire #a3a3a0, accent néon vert #c8ff00 (boutons principaux, liens, badges, focus), rouge destructif #ff5c5c.
- Police unique : Plus Jakarta Sans (400, 500, 600, 700, 800) chargée depuis Google Fonts, appliquée aux titres comme au texte.
- Rayon des bords 12px, bordures fines, aucune ombre lourde, aucun dégradé : esthétique minimaliste, beaucoup d'espace, titres en tracking serré.
- Identité de marque : un cerveau néon vert #c8ff00 et le badge « Base44 Brain », pour montrer que Base44 est le cerveau de l'app (page d'explication et cartes de prompts des pages clés).
- Structure : barre latérale à gauche (logo, nom de l'app, navigation vers chaque page, sélecteur de langue FR/EN, mention « Propulsé par votre serveur MCP Higgsfield ») ; contenu centré en largeur maximale 1152px avec marges généreuses ; entièrement responsive, barre latérale repliée en tiroir sur mobile.
- Tout le texte de l'interface passe par un système de traductions clé → FR/EN, avec détection automatique de la langue du navigateur (anglais → EN, sinon FR) et mémorisation du choix de l'utilisateur. Aucun texte en dur.
- Toute image passe par un composant d'image optimisée (redimensionnement et srcset selon le conteneur). Toutes les listes ont un état de chargement et un état vide illustré.
- Les fichiers privés (photos des personnages, vidéos sources, vidéos générées) ne sont jamais exposés directement : ils s'affichent via des URL signées générées à la demande, et les images passent par une transformation d'URL pour charger vite.

2. ÉCRANS ET NAVIGATION
- Barre latérale, dans cet ordre : Tableau de bord, Mes influenceurs, Banque de modèles, Mes créations, Calendrier, Comment ça marche, Setup Higgsfield, plus le sélecteur de langue.
- / — Tableau de bord : badge « Parcours : Mon influenceur → Une vidéo virale → Ma version », grand titre sur deux lignes, texte d'introduction, deux boutons (« Créer mon influenceur », « Explorer les vidéos virales »), carte d'import depuis la banque de personnages, trois compteurs (Influenceurs, Références virales, Créations), parcours en 3 étapes cliquables présentées en cartes numérotées 01 / 02 / 03 avec un bouton « Ouvrir » (Mon influenceur, Une vidéo virale, Ma version), mention de bas de page sur la génération asynchrone, puis en bas la carte « Prompt maître » (titre, explication, texte du prompt maître dans une zone de texte en lecture seule, bouton « Copier le prompt » avec retour « Copié ») en FR et EN.
- /influenceurs — Mes influenceurs : trois entrées dans l'en-tête — « Créer mon influenceur » (parcours guidé en 24 étapes, voir point 9), « Importer mes photos » (fenêtre d'import de ses propres photos avec un questionnaire : niche, plateforme, audience, ton, traits de personnalité) et « Importer par lien » (fenêtre d'import depuis la banque de personnages, voir point 7). Puis la liste des personnages : photo, nom, niche, marqueur du personnage actif (mémorisé dans le navigateur et repris partout ailleurs, notamment à la génération), ouverture du panneau de bio Instagram générée et copiable, suppression, et la carte « cerveau Base44 » avec ses prompts.
- /videos — Banque de modèles : carte « cerveau Base44 » avec prompts à copier, recherche, filtre par période (6 h, 12 h, 24 h, 7 jours, tout), favoris mémorisés dans le navigateur, ajout d'un modèle par lien (titre, durée et vignette récupérés automatiquement au moment de l'ajout) ou avec un fichier mp4 depuis l'appareil, bouton « Recréer » sur chaque carte.
- /creations — Mes créations : chaque génération avec son état (brouillon, en attente, en cours, prête, échouée), lecture de la vidéo, téléchargement, bouton « Créer une variante » qui annonce « Bientôt disponible » au clic, rafraîchissement automatique des tâches en cours toutes les 8 secondes.
- /calendrier — Calendrier mensuel des publications programmées, bouton « Aujourd'hui », navigation entre les mois, détail du post : aperçu vidéo 9:16, réseau et heure, état (prévu / publié), accroche, légende et hashtags copiables en un clic, ou message invitant à les demander au chat.
- /comment-ca-marche — Explication du produit : badge, titre sur deux lignes, introduction, deux boutons (« Créer mon premier personnage », « Voir mon calendrier »), encart sur le cerveau Base44, « Le principe en 3 temps » (ton studio, ton copilote IA, tes données en contexte), « Ton quotidien » en 4 moments de la journée, exemples de prompts copiables, encarts de conseils.
- /connexion — Setup Higgsfield en deux étapes, la première bloquante : (1) carte « Créer votre compte Higgsfield » dont le bouton ouvre le lien d'affiliation https://higgsfield.ai?fpr=thibault-e42228 dans un nouvel onglet, puis marque l'étape comme faite sur le compte de l'utilisateur (higgsfield_account_created) — l'étape 2 reste verrouillée tant que ce n'est pas validé ; (2) connexion du compte en OAuth (bouton Connecter / Déconnecter, état de la connexion, solde de crédits, outils MCP détectés). Garder ce lien d'affiliation tel quel dans chaque copie.
- /recreer — Lancement de la génération (voir point 5), ouverte depuis une carte de la banque avec les paramètres ?video=<id>&influencer=<id>.
- Authentification : /login, /register, /forgot-password, /reset-password, avec connexion par e-mail et mot de passe ou par Google. Toutes les pages sont privées : un visiteur non connecté est renvoyé vers /login puis ramené à la page demandée.

3. BASE DE DONNÉES (mêmes entités, mêmes champs)
- Influencer : name, notes, reference_image, reference_images (liste), face_reference_image, motion_reference_image, motion_reference_source, niche, platform, audience, tone, personality (liste), tagline, story, instagram_bio, source, source_character_id, source_event_id, import_id, import_key, import_status (pending / ready), imported_at, profile (profil public complet).
- ViralVideo : title, platform (tiktok / instagram / youtube), source_url, thumbnail_url, video_file_uri, duration, published_date, category (danse, lifestyle, humour, beaute, fitness, mode, food, voyage, tech), stats (vues, likes, partages), is_manual, is_demo.
- Creation : influencer_id, influencer_name, viral_video_id, viral_video_title, status (draft / pending / processing / ready / failed), model, duration, aspect_ratio, resolution, is_upscaled, prompt, result_video_url, cost, higgsfield_job_id, error.
- ScheduledPost : creation_id, influencer_id, influencer_name, video_url, platform (tiktok / instagram / youtube), scheduled_date, scheduled_time, hook, caption, hashtags, status (planned / published).
- HiggsfieldAuth (access_token, refresh_token, expires_at, client_id, account, scopes, connected_by) et HiggsfieldOAuth (state, code_verifier, client_id, redirect_uri), accessibles aux administrateurs uniquement : les jetons ne sortent jamais du serveur.
- Sécurité : chaque enregistrement n'est visible et modifiable que par son créateur (ou par un administrateur) ; les modèles de la banque de vidéos sont visibles par tous les utilisateurs connectés.

4. FONCTIONS SERVEUR
- higgsfieldConnect et higgsfieldOAuthCallback : connexion OAuth (PKCE) au compte Higgsfield de l'utilisateur, jetons conservés côté serveur avec rafraîchissement automatique.
- higgsfieldGateway : état de la connexion, liste des outils Higgsfield disponibles, solde de crédits.
- Serveur MCP Higgsfield : l'app parle au compte de l'utilisateur par un canal MCP appelé uniquement côté serveur — découverte des outils disponibles (les modèles de génération), appel d'un outil par son nom, lecture du solde de crédits. Aucun jeton ni identifiant Higgsfield ne transite par le navigateur : l'authentification se fait en OAuth (PKCE) et les jetons sont rafraîchis automatiquement côté serveur. Si le compte n'est pas connecté, ou si le solde de crédits est nul, la génération est bloquée et la raison est affichée à l'utilisateur.
- generateInfluencer et generateInfluencerGpt : génération du personnage (traits, planche de 9 photos avec visage de face, profils et plans larges).
- generateInfluencerStory et generateInstagramBio : histoire du personnage et bio Instagram (3 lignes, 150 caractères maximum).
- importCharacterFromLink : import d'un personnage depuis la banque externe via son lien HTTPS (profil et photos), import atomique et sans doublon pour un même utilisateur (clé utilisateur + source + import_id), état pending puis ready.
- importDriveModels : import groupé de modèles de référence.
- downloadViralVideo : récupération de la vidéo source (mp4) et de sa vignette depuis un lien, stockage privé.
- generateVideo : préparation des références du personnage, envoi de la tâche à Higgsfield, suivi de l'état, marquage en échec des tâches bloquées, estimation du coût.
- generatePostCopy : analyse visuelle de la vidéo (décor, ambiance, tenue) et génération de l'accroche, de la légende et des hashtags, ton direct et typé réseaux sociaux.
- Aucune clé ni aucun compte externe à fournir : tout passe par l'IA incluse dans Base44, appelée côté serveur et facturée en crédits d'intégration sur le compte Base44 du propriétaire de l'app — InvokeLLM pour les textes (histoire, bio, accroche, légende, hashtags) et l'analyse visuelle, GenerateImage pour les portraits, les planches de 9 vues et la photo plein pied du transfert de mouvement.
- Modules serveur partagés : higgsfield (OAuth et appels MCP), mcp (transport), characterReplacement, motionReference, motionFraming, aiText — plus les outils internes de diagnostic Higgsfield gardés en fonctions séparées (hfProbe, hfShape, hfJobProbe, hfDebug).

5. GÉNÉRATION VIDÉO (le cœur du produit)
- Écran /recreer avec la vidéo de référence : la référence et mon influenceur côte à côte en 9:16, sélecteur d'influenceur avec le choix mémorisé, alerte si le compte Higgsfield n'est pas connecté, alerte et blocage si le solde de crédits est nul, bandeau expliquant le mode utilisé.
- Réglages : format (9:16, 1:1, 4:5, 16:9), résolution (1080p, 720p, 4k), tenue, décor, instructions complémentaires. Le modèle et la durée sont automatiques : la durée est exactement celle de la vidéo d'origine et le 1080p natif est privilégié, une mise à l'échelle étant signalée si le modèle ne le permet pas.
- Avec le fichier vidéo source : remplacement de personnage via l'outil Higgsfield dédié (hf_mult_replace_object) — le portrait et les photos d'origine du personnage remplacent la personne principale en conservant le plan, l'environnement et les autres personnes présentes. Aucun repli automatique vers un mode solo.
- Préparation des références avant l'envoi : portrait du visage, photos du personnage et une photo individuelle au cadrage vérifié pour le mouvement, mises en cache et régénérées automatiquement quand le personnage change.
- Sans fichier source : adaptation à partir de la photo et du texte, annoncée clairement comme telle.
- Génération asynchrone : état conservé entre les visites, aucun lancement en double.

6. INTERFACE PILOTÉE PAR LE CHAT
- Les données structurées (posts du calendrier, créations) sont en lecture seule dans l'app : c'est le chat Base44 qui crée et modifie. Aucun formulaire d'édition.
- Chaque page affiche une carte « cerveau Base44 » : titre, explication en une phrase et prompts prêts à copier, avec retour visuel « Copié ».
- Bibliothèque de prompts en 4 thèmes : repérer ce qui buzz (vidéos virales avec leurs liens), écrire accroche / légende / hashtags, écrire les bios, planifier les publications.
- Tous les prompts existent en FR et EN et s'affichent dans la langue active.

7. IMPORT DEPUIS LA BANQUE DE PERSONNAGES
- Sur le tableau de bord : carte d'import avec un champ de lien, un bouton d'ouverture de la banque (https://characters.cashfluenceur.com) et un exemple de lien dans le champ.
- Format de lien accepté, vérifié dans le navigateur puis côté serveur : protocole https, domaine characters.cashfluenceur.com, chemin /import, aucun paramètre de requête, ni identifiant ni mot de passe dans l'URL, et un fragment #token= suivi de 64 caractères hexadécimaux. Le lien n'est ni conservé ni transmis ailleurs qu'à la fonction d'import.
- Étapes affichées pendant l'import : Vérification du lien, Récupération du personnage, Préparation des photos, Personnage prêt. Messages d'erreur dédiés : lien incomplet, lien expiré, connexion momentanément indisponible (le personnage reste réservé), photos non préparées (reprise possible).
- Résultat : le personnage importé avec ses photos, prêt à générer ; import atomique et sans doublon, une même réservation ne crée jamais deux personnages.

8. MISE EN ROUTE DE CHAQUE COPIE
- Aucun secret n'est demandé : pas de clé OpenAI, pas de clé Apify, pas de client OAuth Higgsfield à saisir (le client est enregistré automatiquement en PKCE et l'URL MCP est une constante du code). Suivre seulement le setup Higgsfield en deux étapes depuis la page de connexion : créer son compte Higgsfield avec le lien d'affiliation https://higgsfield.ai?fpr=thibault-e42228 (à conserver tel quel, c'est lui qui alimente le bouton « Créer mon compte Higgsfield »), puis autoriser la connexion. Les jetons restent côté serveur, et la génération tourne sur l'IA incluse dans Base44.

9. PARCOURS DE CRÉATION EN 24 ÉTAPES (contenu exact, aligné sur le funnel de référence)
Mêmes sections, mêmes intitulés, mêmes choix, mêmes visuels : cartes illustrées, grandes options avec icône, ou vignettes d'icônes, dans cet ordre.
1. Votre objectif — Que voulez-vous ? : Être payé par les vues · Partenariats · Vendre mes produits · Devenir viral
2. Votre objectif de revenus — Combien par mois ? : 500 $ / mois · 2 000 $ / mois · 10 000 $ / mois · Je quitte mon job
3. Votre temps — Combien de temps par jour ? (Aucune caméra. Jamais.) : 5 minutes · 30 minutes · 1 heure et +
4. Identité — Qui est-ce ? : Homme · Femme · Non binaire (obligatoire)
5. Origines — Quel look ? : Occidental · Latino/a · Est-asiatique · Africain · Sud-asiatique · Moyen-Orient
6. Âge — Quel âge ? : Jeune · 20 ans · Adulte · 30 ans · Mature · 50 ans · Senior · 70 ans
7. Apparence — Peau : Porcelaine · Ivoire · Sable · Miel · Caramel · Moka · Espresso · Ébène
8. Corps — Corps : Mince · Athlétique · Musclé · Pulpeuse · Bedaine · Grand & élancé
9. Cheveux — Couleur de cheveux : Noir de jais · Châtain foncé · Châtain · Auburn · Roux cuivré · Fraise · Blond · Platine · Gris · Blanc · Rose
10. Coiffure — Coiffure : Wolf cut · Permanente broccoli · Mulet · Butterfly cut · Edgar cut · Afro · Crête · Buzz décoloré · Chauve
11. Yeux — Couleur des yeux : Marron foncé · Ambre · Noisette · Vert · Océan · Bleu glacé · Gris · Violet
12. Yeux — Forme des yeux : Amandes · Ronds · Monopli · Paupières lourdes · Immenses · Yeux de chat
13. Visage — Forme du visage : Normal · Visage long · Cou long · Cou épais · Tête d'œuf · Ronde
14. Visage — Détails du visage (plusieurs choix) : Taches de rousseur · Fossettes · Cernes · Pommettes hautes · Lèvres pulpeuses · Monosourcil · Grain de beauté · Dents du bonheur · Grandes oreilles
15. Visage — Moustache & barbe : Rasé de près · Barbe naissante · Moustache · Bouc · Barbe courte · Barbe pleine · Moustache en guidon · Favoris · Moustache Dalí — étape sautée si le personnage est féminin
16. Détails — Extras fun (plusieurs choix) : Yeux vairons · Tatouage facial · Piercing · Entailles aux sourcils · Grill doré · Tempête de taches · Pierres sur le visage · Oreilles d'elfe · Cicatrice au sourcil
17. Détails — Accessoire : Aucun · Lunettes · Casque · Bijoux dorés · Chapeau bob · Monocle · Perles · Nœud papillon · Chapeau à plume
18. Personnalité — Quel vibe ? : Luxe · Drôle · Inspirant · Sombre & provoc · Bienveillant · Boss sauvage · Zen · Romantique · Drama
19. Style — Tenue : Vieux argent · Djellaba · Pull de grand-père · Disco 70s · Dandy · Chic Riviera · Peignoir en soie · Costume lilas · Safari · Or & fourrure · Tunique rouge · Survêtement velours
20. Plateforme — Quelle appli ? : Instagram (Reels) · TikTok (FYP viral) · YouTube (format long) · Toutes
21. Partenariats — Quelles marques ? (plusieurs choix) : Mode · Sneakers · Beauté · Tech · Applications · Perte de poids · Fitness · Boissons · Food
22. Publication — À quelle fréquence ? : 5× par jour · 3× par jour · 1× par jour · 2× par semaine
23. Identité — Donnez-lui un nom (obligatoire) : champ libre, avec des idées de prénom et de nom proposées automatiquement selon le genre
24. Presque fini — Prêt à lui donner vie ? (obligatoire) : récapitulatif des traits retenus, de l'univers souhaité et « Votre star + 30 posts », puis lancement de la génération.
Règles de traduction vers le moteur de génération : chaque choix correspond à un identifiant de trait (genre, origine, âge, teint, corps, couleur et coupe de cheveux, yeux, forme du visage, détails du visage, barbe, extras, accessoire, esthétique). Un seul choix par groupe, sauf les détails du visage et les extras fun (2 au maximum) et l'accessoire (3 au maximum) ; au-delà du plafond, le choix part dans le texte du brief. Les traits non choisis dans les étapes optionnelles (détails du visage, extras, accessoire, barbe) sont explicitement interdits dans le brief pour que le moteur ne les invente pas. Le brief final contient tous les choix, les traits interdits, le nom, les marques souhaitées et l'univers libre, limité en longueur, les choix passant en premier pour qu'une saisie longue ne les écrase pas. Après le parcours : planche de 9 photos du personnage (visage de face, profils, plans larges), histoire, phrase d'accroche et bio Instagram de 3 lignes.

Critère de réussite : l'application obtenue doit être identique à celle-ci, écran par écran et fonctionnalité par fonctionnalité. Ne remplace, ne simplifie et n'omets aucun élément.`,

  en: `Build a web app called "InfluenceIA": a studio to create AI influencers and generate their own videos from viral videos. Reproduce exactly the design, the screens and the features described below. Do not simplify anything, do not replace any screen with a reduced version, do not add anything else.

1. DESIGN (strictly identical)
- Dark theme only: background #080808, cards #121212, borders #262626, main text #f5f5f2, secondary text #a3a3a0, neon green accent #c8ff00 (primary buttons, links, badges, focus), destructive red #ff5c5c.
- Single font: Plus Jakarta Sans (400, 500, 600, 700, 800) loaded from Google Fonts, applied to headings and body text alike.
- 12px border radius, thin borders, no heavy shadows, no gradients: minimal aesthetic, generous spacing, tight-tracking headings.
- Brand identity: a neon green brain #c8ff00 and the "Base44 Brain" badge, to show that Base44 is the brain of the app (explainer page and prompt cards on the key pages).
- Structure: left sidebar (logo, app name, navigation to every page, FR/EN language switcher, line "Powered by your Higgsfield MCP server"); content centered at a maximum width of 1152px with generous padding; fully responsive, sidebar collapsed into a drawer on mobile.
- Every piece of interface text goes through a key -> FR/EN translation system, with automatic browser language detection (English -> EN, otherwise FR) and the user's choice remembered. No hardcoded text.
- Every image goes through an optimized image component (resizing and srcset based on its container). Every list has a loading state and an illustrated empty state.
- Private files (character photos, source videos, generated videos) are never exposed directly: they display through signed URLs generated on demand, and images go through URL transformation to load fast.

2. SCREENS AND NAVIGATION
- Sidebar, in this order: Dashboard, My influencers, Model library, My creations, Calendar, How it works, Higgsfield setup, plus the language switcher.
- / - Dashboard: badge "My influencer -> A viral video -> My version", large two-line heading, intro text, two buttons ("Create my influencer", "Explore viral videos"), import card from the character bank, three counters (Influencers, Viral references, Creations), 3 clickable steps shown as numbered cards 01 / 02 / 03 with an "Open" button (My influencer, A viral video, My version), footer note about asynchronous generation, then at the bottom the "Master prompt" card (title, explanation, the master prompt text in a read-only text area, a "Copy the prompt" button with a "Copied" feedback) in FR and EN.
- /influenceurs - My influencers: three entries in the header - "Create my influencer" (guided 24-step funnel, see point 9), "Import my photos" (window to import your own photos with a questionnaire: niche, platform, audience, tone, personality traits) and "Import by link" (import window from the character bank, see point 7). Then the list of characters: photo, name, niche, active-character marker (remembered in the browser and reused everywhere else, including at generation), opening the generated and copyable Instagram bio panel, delete, and the "Base44 brain" card with its prompts.
- /videos - Model library: "Base44 brain" card with prompts to copy, search, period filter (6h, 12h, 24h, 7 days, all time), favourites remembered in the browser, adding a model by link (title, duration and thumbnail fetched automatically at that moment) or with an mp4 file from the device, a "Recreate" button on each card.
- /creations - My creations: every generation with its status (draft, queued, generating, ready, failed), video playback, download, a "Create a variant" button announcing "Coming soon" on click, automatic refresh of the running jobs every 8 seconds.
- /calendrier - Monthly calendar of scheduled posts, a "Today" button, month navigation, post detail: 9:16 video preview, platform and time, status (planned / published), hook, caption and hashtags copyable in one click, or a message inviting you to ask the chat for them.
- /comment-ca-marche - Product explanation: badge, two-line heading, introduction, two buttons ("Create my first character", "See my calendar"), a panel about the Base44 brain, "The principle in 3 steps" (your studio, your AI copilot, your data in context), "Your daily routine" in 4 moments of the day, copyable prompt examples, advice panels.
- /connexion - Two-step Higgsfield setup, the first one blocking: (1) a "Create your Higgsfield account" card whose button opens the affiliate link https://higgsfield.ai?fpr=thibault-e42228 in a new tab, then marks the step as done on the user's account (higgsfield_account_created) - step 2 stays locked until it is validated; (2) connecting the account over OAuth (Connect / Disconnect buttons, connection state, credit balance, detected MCP tools). Keep this affiliate link as is in every copy.
- /recreer - Launch the generation (see point 5), opened from a library card with the parameters ?video=<id>&influencer=<id>.
- Authentication: /login, /register, /forgot-password, /reset-password, with email and password or Google sign-in. Every page is private: a visitor who is not logged in is sent to /login and then back to the requested page.

3. DATABASE (same entities, same fields)
- Influencer: name, notes, reference_image, reference_images (list), face_reference_image, motion_reference_image, motion_reference_source, niche, platform, audience, tone, personality (list), tagline, story, instagram_bio, source, source_character_id, source_event_id, import_id, import_key, import_status (pending / ready), imported_at, profile (full public profile).
- ViralVideo: title, platform (tiktok / instagram / youtube), source_url, thumbnail_url, video_file_uri, duration, published_date, category (danse, lifestyle, humour, beaute, fitness, mode, food, voyage, tech), stats (views, likes, shares), is_manual, is_demo.
- Creation: influencer_id, influencer_name, viral_video_id, viral_video_title, status (draft / pending / processing / ready / failed), model, duration, aspect_ratio, resolution, is_upscaled, prompt, result_video_url, cost, higgsfield_job_id, error.
- ScheduledPost: creation_id, influencer_id, influencer_name, video_url, platform (tiktok / instagram / youtube), scheduled_date, scheduled_time, hook, caption, hashtags, status (planned / published).
- HiggsfieldAuth (access_token, refresh_token, expires_at, client_id, account, scopes, connected_by) and HiggsfieldOAuth (state, code_verifier, client_id, redirect_uri), readable and writable by admins only: tokens never leave the server.
- Security: every record is visible and editable only by its creator (or by an admin); the library's video models are visible to every logged-in user.

4. SERVER FUNCTIONS
- higgsfieldConnect and higgsfieldOAuthCallback: OAuth (PKCE) connection to the user's Higgsfield account, tokens kept server-side with automatic refresh.
- higgsfieldGateway: connection state, list of available Higgsfield tools, credit balance.
- Higgsfield MCP server: the app talks to the user's account over an MCP channel called server-side only - discovering the available tools (the generation models), calling a tool by name, reading the credit balance. No Higgsfield token or credential ever goes through the browser: authentication happens over OAuth (PKCE) and tokens are refreshed automatically server-side. If the account is not connected, or the credit balance is zero, the generation is blocked and the reason is shown to the user.
- generateInfluencer and generateInfluencerGpt: character generation (traits, a sheet of 9 photos with a frontal face, profiles and wide shots).
- generateInfluencerStory and generateInstagramBio: character story and Instagram bio (3 lines, 150 characters maximum).
- importCharacterFromLink: import a character from the external bank through its HTTPS link (profile and photos), atomic import with no duplicates for the same user (key: user + source + import_id), status pending then ready.
- importDriveModels: bulk import of reference models.
- downloadViralVideo: fetch the source video (mp4) and its thumbnail from a link, private storage.
- generateVideo: prepare the character references, submit the Higgsfield job, track its status, mark stalled jobs as failed, estimate the cost.
- generatePostCopy: visual analysis of the video (setting, mood, outfit) and generation of the hook, the caption and the hashtags, in a direct social-media tone.
- No key and no third-party account to provide: everything runs on Base44's built-in AI, called server-side and billed as integration credits on the app owner's Base44 account - InvokeLLM for texts (story, bio, hook, caption, hashtags) and visual analysis, GenerateImage for portraits, the 9-view sheets and the full-body motion-transfer photo.
- Shared server modules: higgsfield (OAuth and MCP calls), mcp (transport), characterReplacement, motionReference, motionFraming, aiText - plus the internal Higgsfield diagnostic helpers kept as separate functions (hfProbe, hfShape, hfJobProbe, hfDebug).

5. VIDEO GENERATION (the core of the product)
- /recreer screen with the reference video: the reference and my influencer side by side in 9:16, influencer picker with the choice remembered, warning if the Higgsfield account is not connected, warning and blocking when the credit balance is zero, banner explaining the mode being used.
- Settings: aspect ratio (9:16, 1:1, 4:5, 16:9), resolution (1080p, 720p, 4k), outfit, setting, extra instructions. Model and duration are automatic: the duration is exactly the source video's, native 1080p is preferred, and an upscale is flagged when the model does not allow it.
- With the source video file: character replacement through the dedicated Higgsfield tool (hf_mult_replace_object) - the character's portrait and original photos replace the main person while keeping the shot, the environment and the other people in frame. No automatic fallback to a solo mode.
- Reference preparation before sending: face portrait, character photos and a single photo with a verified framing for motion, cached and regenerated automatically when the character changes.
- Without a source file: an adaptation from the photo and the text, clearly announced as such.
- Asynchronous generation: state kept between visits, no duplicate launches.

6. CHAT-DRIVEN INTERFACE
- Structured data (calendar posts, creations) is read-only in the app: the Base44 chat is what creates and changes it. No editing forms.
- Every page shows a "Base44 brain" card: title, one-sentence explanation and prompts ready to copy, with a "Copied" visual feedback.
- Prompt library in 4 themes: spotting what is trending (viral videos with their links), writing the hook / caption / hashtags, writing the bios, planning the posts.
- Every prompt exists in FR and EN and displays in the active language.

7. IMPORT FROM THE CHARACTER BANK
- On the dashboard: an import card with a link field, a button opening the bank (https://characters.cashfluenceur.com) and an example link in the field.
- Accepted link format, checked in the browser then server-side: https protocol, hostname characters.cashfluenceur.com, path /import, no query parameter, no username or password in the URL, and a #token= fragment followed by 64 hexadecimal characters. The link is neither stored nor sent anywhere except to the import function.
- Steps shown during the import: Checking the link, Fetching the character, Preparing the photos, Character ready. Dedicated error messages: incomplete link, expired link, connection temporarily unavailable (the character stays reserved), photos not prepared (can be resumed).
- Result: the imported character with its photos, ready to generate; atomic import with no duplicates, the same reservation never creates two characters.

8. SETUP FOR EVERY COPY
- No secret is requested: no OpenAI key, no Apify key, no Higgsfield OAuth client to enter (the client registers itself in PKCE and the MCP URL is a constant in the code). Only follow the two-step Higgsfield setup from the connection page: create your Higgsfield account through the affiliate link https://higgsfield.ai?fpr=thibault-e42228 (keep it as is, it is what backs the "Create my Higgsfield account" button), then authorise the connection. Tokens stay server-side, and generation runs on Base44's built-in AI.

9. CREATION FUNNEL IN 24 STEPS (exact content, aligned on the reference funnel)
Same sections, same titles, same choices, same visuals: illustrated cards, large options with an icon, or icon tiles, in this order.
1. Your goal - What do you want? : Get paid for views · Partnerships · Sell my products · Go viral
2. Your income goal - How much per month? : $500 / month · $2,000 / month · $10,000 / month · I'm quitting my job
3. Your time - How much time per day? (No camera. Ever.) : 5 minutes · 30 minutes · 1 hour+
4. Identity - Who is it? : Man · Woman · Non-binary (required)
5. Origins - Which look? : Western · Latino/a · East Asian · African · South Asian · Middle Eastern
6. Age - How old? : Young · 20 · Adult · 30 · Mature · 50 · Senior · 70
7. Appearance - Skin : Porcelain · Ivory · Sand · Honey · Caramel · Mocha · Espresso · Ebony
8. Body - Body : Slim · Athletic · Muscular · Curvy · Belly · Tall and lean
9. Hair - Hair colour : Jet black · Dark brown · Chestnut · Auburn · Copper red · Strawberry · Blonde · Platinum · Grey · White · Pink
10. Hairstyle - Hairstyle : Wolf cut · Broccoli perm · Mullet · Butterfly cut · Edgar cut · Afro · Mohawk · Bleached buzz · Bald
11. Eyes - Eye colour : Dark brown · Amber · Hazel · Green · Ocean · Ice blue · Grey · Violet
12. Eyes - Eye shape : Almond · Round · Monolid · Hooded · Huge · Cat eyes
13. Face - Face shape : Normal · Long face · Long neck · Thick neck · Egg head · Round
14. Face - Face details (multiple choices) : Freckles · Dimples · Eye bags · High cheekbones · Full lips · Unibrow · Beauty mark · Gapped teeth · Big ears
15. Face - Moustache & beard : Clean shaven · Stubble · Moustache · Goatee · Short beard · Full beard · Handlebar moustache · Sideburns · Dalí moustache - step skipped for a female character
16. Details - Fun extras (multiple choices) : Heterochromia · Face tattoo · Piercing · Eyebrow slits · Gold grillz · Freckle storm · Face gems · Elf ears · Eyebrow scar
17. Details - Accessory : None · Glasses · Headphones · Gold jewellery · Bucket hat · Monocle · Pearls · Bow tie · Feathered hat
18. Personality - Which vibe? : Luxury · Funny · Inspiring · Dark and edgy · Wholesome · Savage boss · Zen · Romantic · Drama
19. Style - Outfit : Old money · Djellaba · Grandpa knit · 70s disco · Dandy · Riviera chic · Silk robe · Lilac suit · Safari · Gold and fur · Red tunic · Velour tracksuit
20. Platform - Which app? : Instagram (Reels) · TikTok (viral FYP) · YouTube (long form) · All of them
21. Partnerships - Which brands? (multiple choices) : Fashion · Sneakers · Beauty · Tech · Apps · Weight loss · Fitness · Drinks · Food
22. Posting - How often? : 5x a day · 3x a day · 1x a day · 2x a week
23. Identity - Give it a name (required) : free field, with first and last name ideas suggested automatically based on the gender
24. Almost done - Ready to bring it to life? (required) : recap of the chosen traits, the desired universe and "Your star + 30 posts", then the generation launch.
Mapping rules to the generation engine: each choice matches a trait identifier (gender, origin, age, skin tone, body, hair colour and cut, eyes, face shape, face details, beard, extras, accessory, aesthetic). One choice per group, except face details and fun extras (2 maximum) and accessory (3 maximum); beyond the cap, the choice goes into the prompt text. Traits not chosen in the optional steps (face details, extras, accessory, beard) are explicitly forbidden in the brief so the engine does not invent them. The final brief contains every choice, the forbidden traits, the name, the wanted brands and the free universe text, length-limited, with the choices first so a long free text can never override them. After the funnel: a sheet of 9 character photos (frontal face, profiles, wide shots), a story, a tagline and a 3-line Instagram bio.

Success criterion: the resulting application must be identical to this one, screen by screen and feature by feature. Do not replace, simplify or omit anything.`,
};

export function masterPrompt(lang) {
  return MASTER_PROMPT[lang] || MASTER_PROMPT.fr;
}