// Prompt maître : à coller dans le chat Base44 pour recréer cette application à l'identique (design + fonctionnalités).
export const MASTER_PROMPT = {
  fr: `Construis une application web nommée « CAI ⚜️ - CASHFLUENCER AI - BRAIN DE BASE » : un studio pour créer des influenceurs IA et générer, à partir de vidéos virales, leurs propres vidéos. Reproduis exactement le design, les écrans et les fonctionnalités décrits ci-dessous. Ne simplifie rien, ne remplace aucun écran par une version réduite, n'ajoute rien d'autre. Ne pose aucune question et ne demande aucune confirmation : construis toute l'application en une seule fois, du premier au dernier fichier, pour que le build passe du premier coup ; en cas de doute, prends toi-même la décision la plus fidèle à ce document.

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
- generateInfluencer et generateInfluencerGpt : génération du personnage en deux temps — d'abord 9 propositions de portrait, une seule image par appel (trois familles de trois : fidèles au brief, glamour, déjantées, chacune étiquetée), puis la planche finale du personnage retenu (grille 3×3 de 9 vues : visage de face, profils, plans larges), composée en renvoyant le portrait retenu comme image de référence.
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
- Aucun secret n'est demandé : pas de clé OpenAI, pas de clé Apify, pas de client OAuth Higgsfield à saisir (le client est enregistré automatiquement en PKCE et l'URL MCP est une constante du code). Suivre seulement le setup Higgsfield en deux étapes depuis la page de connexion : créer son compte Higgsfield avec le lien d'affiliation https://higgsfield.ai?fpr=thibault-e42228 (à conserver tel quel, c'est lui qui alimente le bouton « Créer mon compte Higgsfield »), puis autoriser la connexion. Les jetons restent côté serveur, la génération tourne sur l'IA incluse dans Base44, et c'est le seul branchement de toute l'app : Higgsfield mis à part, l'utilisateur n'a aucune clé, aucun compte ni aucun formulaire à remplir.

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
Règles de traduction vers le moteur de génération : chaque choix correspond à un identifiant de trait (genre, origine, âge, teint, corps, couleur et coupe de cheveux, yeux, forme du visage, détails du visage, barbe, extras, accessoire, esthétique). Un seul choix par groupe, sauf les détails du visage et les extras fun (2 au maximum) et l'accessoire (3 au maximum) ; au-delà du plafond, le choix part dans le texte du brief. Les traits non choisis dans les étapes optionnelles (détails du visage, extras, accessoire, barbe) sont explicitement interdits dans le brief pour que le moteur ne les invente pas. Le brief final contient tous les choix, les traits interdits, le nom, les marques souhaitées et l'univers libre, limité en longueur, les choix passant en premier pour qu'une saisie longue ne les écrase pas. Après le parcours : 9 propositions de portrait générées une par une par l'IA incluse dans Base44 (GenerateImage, aucune clé externe), puis la planche de 9 photos du personnage retenu (visage de face, profils, plans larges), son histoire, sa phrase d'accroche et sa bio Instagram de 3 lignes.

Critère de réussite : l'application obtenue doit être identique à celle-ci, écran par écran et fonctionnalité par fonctionnalité. Ne remplace, ne simplifie et n'omets aucun élément. Aucune question, aucun aller-retour, aucune étape intermédiaire : tout est livré en un seul build, complet et fonctionnel.`,

};

export function masterPrompt(lang) {
  return MASTER_PROMPT[lang] || MASTER_PROMPT.fr;
}