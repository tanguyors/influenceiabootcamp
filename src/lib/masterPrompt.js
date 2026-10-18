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

2. ÉCRANS ET NAVIGATION
- / — Tableau de bord : badge « Parcours : Mon influenceur → Une vidéo virale → Ma version », grand titre sur deux lignes, texte d'introduction, deux boutons (« Créer mon influenceur », « Explorer les vidéos virales »), carte d'import depuis la banque de personnages, trois compteurs (Influenceurs, Références virales, Créations), parcours en 3 étapes cliquables (Mon influenceur, Une vidéo virale, Ma version), mention de bas de page sur la génération asynchrone.
- /influenceurs — Mes influenceurs : création d'un personnage par IA sous forme de funnel pas à pas (questionnaire : niche, plateforme, audience, ton, traits de personnalité ; puis génération des traits et du prompt, planche de 9 photos, choix du nom, histoire et phrase d'accroche) ou import de ses propres photos, cartes de personnages avec leurs photos, panneau de bio Instagram, suppression.
- /videos — Banque de modèles : carte « cerveau Base44 » avec prompts à copier, recherche, filtre par période (6 h, 12 h, 24 h, 7 jours, tout), favoris, ajout d'un modèle par lien, pièce jointe du fichier mp4 source, bouton « Recréer ».
- /creations — Mes créations : chaque génération avec son état (brouillon, en attente, en cours, prête, échouée), lecture de la vidéo, téléchargement, relance, rafraîchissement automatique toutes les 8 secondes.
- /calendrier — Calendrier mensuel des publications programmées, navigation entre les mois, détail du post et son état (prévu / publié).
- /comment-ca-marche — Explication du produit (le principe, les 3 idées, la routine quotidienne, ce qu'on peut demander à l'IA) et bibliothèque de prompts copiables.
- /connexion — Setup Higgsfield en deux étapes, la première bloquante : (1) carte « Créer votre compte Higgsfield » dont le bouton ouvre le lien d'affiliation https://higgsfield.ai?fpr=thibault-e42228 dans un nouvel onglet, puis marque l'étape comme faite sur le compte de l'utilisateur (higgsfield_account_created) — l'étape 2 reste verrouillée tant que ce n'est pas validé ; (2) connexion du compte en OAuth (bouton Connecter / Déconnecter, état de la connexion, solde de crédits, outils MCP détectés). Garder ce lien d'affiliation tel quel dans chaque copie.
- /recreer — Lancement de la génération (voir point 5).
- Authentification : /login, /register, /forgot-password, /reset-password. Toutes les pages sont privées : un visiteur non connecté est renvoyé vers /login puis ramené à la page demandée.

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
- Deux secrets côté serveur, jamais dans le navigateur : la clé OpenAI (personnages, textes, visuels) et la clé Apify (recherche et récupération des vidéos virales).

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
- Sur le tableau de bord : carte d'import avec un champ de lien (HTTPS uniquement), vérification du domaine, étapes d'avancement affichées, puis résultat : le personnage importé avec ses photos, prêt à générer.

8. MISE EN ROUTE DE CHAQUE COPIE
- Ajouter les secrets OPENAI_API_KEY et APIFY_TOKEN côté serveur, puis suivre le setup Higgsfield en deux étapes depuis la page de connexion : créer son compte Higgsfield avec le lien d'affiliation https://higgsfield.ai?fpr=thibault-e42228 (à conserver tel quel, c'est lui qui alimente le bouton « Créer mon compte Higgsfield »), puis autoriser la connexion. Les jetons restent côté serveur et aucune clé API n'est demandée à l'utilisateur.

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

2. SCREENS AND NAVIGATION
- / - Dashboard: badge "My influencer -> A viral video -> My version", large two-line heading, intro text, two buttons ("Create my influencer", "Explore viral videos"), import card from the character bank, three counters (Influencers, Viral references, Creations), 3 clickable steps (My influencer, A viral video, My version), footer note about asynchronous generation.
- /influenceurs - My influencers: create a character with AI as a step-by-step funnel (questionnaire: niche, platform, audience, tone, personality traits; then generation of the traits and the prompt, a sheet of 9 photos, name choice, story and tagline) or import your own photos, character cards with their photos, Instagram bio panel, delete.
- /videos - Model library: "Base44 brain" card with prompts to copy, search, period filter (6h, 12h, 24h, 7 days, all time), favourites, add a model by link, attach the source mp4 file, "Recreate" button.
- /creations - My creations: every generation with its status (draft, queued, generating, ready, failed), video playback, download, relaunch, automatic refresh every 8 seconds.
- /calendrier - Monthly calendar of scheduled posts, month navigation, post detail and its status (planned / published).
- /comment-ca-marche - Product explanation (the principle, the 3 ideas, the daily routine, what you can ask the AI) and a library of copyable prompts.
- /connexion - Two-step Higgsfield setup, the first one blocking: (1) a "Create your Higgsfield account" card whose button opens the affiliate link https://higgsfield.ai?fpr=thibault-e42228 in a new tab, then marks the step as done on the user's account (higgsfield_account_created) - step 2 stays locked until it is validated; (2) connecting the account over OAuth (Connect / Disconnect buttons, connection state, credit balance, detected MCP tools). Keep this affiliate link as is in every copy.
- /recreer - Launch the generation (see point 5).
- Authentication: /login, /register, /forgot-password, /reset-password. Every page is private: a visitor who is not logged in is sent to /login and then back to the requested page.

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
- Two server-side secrets, never in the browser: the OpenAI key (characters, texts, visuals) and the Apify key (finding and fetching viral videos).

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
- On the dashboard: an import card with a link field (HTTPS only), domain check, visible progress steps, then the result: the imported character with its photos, ready to generate.

8. SETUP FOR EVERY COPY
- Add the OPENAI_API_KEY and APIFY_TOKEN secrets server-side, then follow the two-step Higgsfield setup from the connection page: create your Higgsfield account through the affiliate link https://higgsfield.ai?fpr=thibault-e42228 (keep it as is, it is what backs the "Create my Higgsfield account" button), then authorise the connection. Tokens stay server-side and the user is never asked for an API key.

Success criterion: the resulting application must be identical to this one, screen by screen and feature by feature. Do not replace, simplify or omit anything.`,
};

export function masterPrompt(lang) {
  return MASTER_PROMPT[lang] || MASTER_PROMPT.fr;
}