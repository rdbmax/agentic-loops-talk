export const chapters = [
  "Le déclic",
  "Sous le capot",
  "Déjà partout",
  "Le direct",
  "Les patterns",
  "À vous",
] as const;

export const slides = [
  {
    id: "depart", chapter: 0, title: "Un modèle parle.\nUne boucle agit.",
    subtitle: "Comprendre et développer des boucles d’outils agentiques.",
    seconds: 60, speaker: "Duo", cue: "Installer la promesse",
    notes: [
      "A : « Dans notre application de voyage, une réponse ne suffit pas : il faut aussi trouver des propositions et les placer sur une carte. »",
      "B : « Dans 30 minutes, vous saurez dessiner cette boucle, la coder et décider où mettre ses limites. »",
      "Pas un cours sur l’entraînement des LLM, ni un catalogue de frameworks. Un mécanisme, une application, quelques variantes.",
    ],
  },
  {
    id: "montre", chapter: 0, title: "« Tu as l’heure ? »",
    subtitle: "Savoir répondre n’est pas la même chose qu’avoir l’information.",
    seconds: 60, speaker: "Duo", cue: "Jouer la scène, puis révéler",
    notes: [
      "A pose la question. B hésite, consulte sa montre, puis donne l’heure. Cliquer sur chaque étape après l’avoir jouée.",
      "La montre est une source externe. La consulter est une action ; son affichage est une observation.",
      "Préciser : c’est une analogie pédagogique, pas une description du fonctionnement du cerveau ou des pensées du modèle. L’heure de l’exemple est fixe.",
    ],
  },
  {
    id: "calendrier", chapter: 0, title: "« On est en retard ? »",
    subtitle: "Une question. Deux observations. Une réponse contextualisée.",
    seconds: 60, speaker: "Duo", cue: "Ajouter le deuxième outil",
    notes: [
      "A demande si nous sommes en retard au rendez-vous. B consulte la montre et le calendrier : 14 h 07 pour un rendez-vous à 14 h.",
      "Montrer les deux résultats, puis répondre « de 7 minutes ». Ce cas suppose que nous sommes déjà au lieu du rendez-vous.",
      "Montre et calendrier peuvent être consultés en parallèle si aucune entrée ne dépend de l’autre. Pour savoir si nous arriverons à temps, il faudrait aussi le trajet.",
    ],
  },
  {
    id: "boucle", chapter: 1, title: "La boucle, sans magie.",
    subtitle: "Le modèle propose. Votre code garde les commandes.",
    seconds: 120, speaker: "A", cue: "Parcourir les six étapes",
    notes: [
      "Faire avancer le diagramme : contexte, modèle, appel structuré, validation/exécution, résultat, nouvel appel. Une réponse finale ferme la boucle.",
      "Le LLM n’exécute pas une fonction JavaScript. Il produit un nom d’outil et des arguments ; l’orchestrateur contrôle et exécute.",
      "Un tour utilisateur peut déclencher plusieurs steps. Une step correspond ici à une génération du modèle et aux éventuelles exécutions d’outils qui en découlent.",
      "Un appel d’outil seul n’est pas encore une boucle autonome. La boucle réinjecte l’observation et laisse le modèle décider de la suite, dans les limites du code.",
    ],
  },
  {
    id: "contraintes", chapter: 1, title: "Des outils. Pas carte blanche.",
    subtitle: "Les capacités autorisées évoluent avec l’état de la boucle.",
    seconds: 90, speaker: "A", cue: "Activer les garde-fous",
    notes: [
      "Avant une recherche : chercher. Après la recherche : vérifier. Après une vérification réussie : afficher les trajets vérifiés.",
      "prepareStep permet de restreindre activeTools. La validation métier dans execute reste indispensable : le prompt et le schéma ne sont pas une autorisation.",
      "Prévoir plafond de steps, temps, tokens, annulation ; pour une réservation réelle : confirmation humaine, authentification et idempotence.",
      "Les résultats externes sont des données non fiables, pas des instructions prioritaires. Aucun outil de paiement ni d’écriture métier dans cette démo.",
    ],
  },
  {
    id: "contexte", chapter: 1, title: "La mémoire du chat ?\nUn contexte construit.",
    subtitle: "Historique visible, état applicatif et contexte modèle sont trois choses différentes.",
    seconds: 90, speaker: "B", cue: "Ajouter un nouveau message",
    notes: [
      "Dans la démo, l’application reconstruit et transmet les messages nécessaires à chaque tour et entre les steps de la boucle.",
      "Ce n’est pas universel : d’autres API permettent de référencer un état de conversation stocké côté service. La responsabilité du contexte reste un choix d’architecture.",
      "Le contexte peut inclure instructions système, schémas d’outils, messages, résultats et résumé. Il n’est pas nécessairement identique à l’intégralité du chat affiché.",
      "La fenêtre de contexte est finie. Même si le SDK fait le transport pour nous, il faut choisir ce qu’on lui donne.",
    ],
  },
  {
    id: "cache", chapter: 1, title: "Réutiliser le préfixe.\nPas la réponse.",
    subtitle: "Si disponible, le prompt caching réutilise du calcul d’entrée sur un contexte stable.",
    seconds: 90, speaker: "B", cue: "Comparer deux requêtes",
    notes: [
      "Placer le contenu stable avant le contenu variable : instructions, définitions des outils, puis conversation.",
      "La prise en charge et la configuration du cache varient selon le modèle et le fournisseur : cache automatique ou explicite, seuils, durée, tarification.",
      "Le contexte reste logiquement disponible pour la génération ; il peut être renvoyé ou référencé selon l’API. Le cache n’est ni une mémoire utilisateur, ni un cache de réponses, ni un moyen d’agrandir la fenêtre.",
      "Modifier les outils ou le préfixe peut réduire la réutilisation. Ne pas promettre un pourcentage de gain sans mesure. La démo n’active pas de cache explicite ; lire les métriques si le fournisseur les expose.",
    ],
  },
  {
    id: "compaction", chapter: 1, title: "Alléger le contexte.\nGarder la conversation.",
    subtitle: "Deux vues d’une même histoire, pour deux destinataires différents.",
    seconds: 90, speaker: "B", cue: "Compacter la vue modèle",
    notes: [
      "Activer la compaction pédagogique. La colonne utilisateur ne bouge pas ; la colonne modèle conserve contraintes, décisions et messages récents.",
      "Une stratégie réelle garde les messages complets dans le stockage applicatif et construit un contexte dérivé. Ne pas casser les paires tool-call / tool-result.",
      "Le résumé est une compression avec perte. Préserver faits sourcés, refus, identifiants, budget et décisions ; vérifier son exactitude.",
      "Cette interaction illustre le principe avec un résumé écrit à l’avance. Ce n’est pas une compaction réellement exécutée sur la conversation de la démo.",
    ],
  },
  {
    id: "interface", chapter: 1, title: "Un outil peut aussi\nfaire bouger l’interface.",
    subtitle: "Une action UI typée, plutôt qu’une instruction cachée dans le texte.",
    seconds: 90, speaker: "A", cue: "Tracer l’itinéraire",
    notes: [
      "Un appel showItinerary produit une commande déclarative structurée. React affiche les trajets. Le modèle ne fabrique ni JavaScript ni HTML exécutable.",
      "Deux designs possibles : exécution côté navigateur avec acquittement envoyé au modèle ; ou préparation côté serveur, puis rendu via le flux.",
      "La démo utilise la deuxième option : le résultat signifie « commande préparée », pas « l’utilisateur a vu la carte ». Ne pas inventer un acquittement du navigateur.",
      "Si l’action doit être réellement confirmée avant la suite, attendre un résultat client ; sans execute ni résultat renvoyé, la boucle ne continue pas automatiquement.",
    ],
  },
  {
    id: "raisonnement", chapter: 1, title: "Observer les décisions.\nPas lire les pensées.",
    subtitle: "Le raisonnement aide à choisir une action. Il ne remplace pas sa vérification.",
    seconds: 90, speaker: "B", cue: "Distinguer trace et explication",
    notes: [
      "Certains modèles proposent un mode de raisonnement, avec coûts, latence, budget et formats spécifiques. Ce n’est pas nécessaire pour appeler un outil.",
      "Ne pas présenter une animation « je réfléchis » comme le raisonnement interne réel. Une explication générée n’est pas une preuve causale.",
      "La trace utile contient les outils autorisés, appels, arguments, résultats, erreurs, durées et tokens. Elle est observée, pas inventée.",
      "Dans notre démo, aucun raisonnement interne n’est affiché ni activé explicitement. Le journal est celui des opérations exécutées.",
    ],
  },
  {
    id: "assistants", chapter: 2, title: "Vous utilisez déjà\nces boucles.",
    subtitle: "Le passage du chatbot à l’assistant capable d’agir.",
    seconds: 180, speaker: "Duo", cue: "Relier aux usages de la salle",
    notes: [
      "A : prendre un assistant de code : lire les fichiers, proposer un patch, lancer les tests, observer une erreur, corriger. B : faire nommer à la salle le modèle, les outils et les observations.",
      "ChatGPT ou Claude peuvent aussi chercher sur le web, lire des documents ou exécuter du code, selon le produit, le mode et les permissions. Toutes leurs réponses ne déclenchent pas une boucle.",
      "La messagerie n’est que l’interface. Le système combine modèle, orchestration, contexte, outils et contrôles.",
      "Un workflow impose la trajectoire dans le code ; une boucle agentique laisse le modèle choisir une partie des actions. Ce sont des degrés de contrôle, pas deux mondes étanches.",
    ],
  },
  {
    id: "demo", chapter: 3, title: "Prochain arrêt :\nla Voie Lactée.",
    subtitle: "Une vraie boucle. Des trains fictifs. Des correspondances à vérifier.",
    seconds: 300, speaker: "Duo", cue: "Lancer la mission, puis la modifier",
    notes: [
      "0:00–1:30 : demander deux destinations calmes, en train de nuit, à moins de 900 crédits aller-retour. Lire la trace pendant que les trajets apparaissent.",
      "1:30–2:30 : demander « Et sans correspondance ? ». Montrer que la démo reconstruit le contexte de la conversation et que le choix d’outils reste contraint.",
      "2:30–4:00 : nouvelle conversation, demander une aventure sur Sirocco. L’outil signale une ligne fermée ; le modèle doit expliquer ou chercher une alternative. La trajectoire exacte est générative.",
      "4:00–5:00 : distinguer choix du modèle et résultats déterministes. A pilote le chat, B commente uniquement les événements observés.",
      "Avant le talk : configurer et tester la clé, l’accès au modèle et sa capacité d’appel d’outils. En cas de panne, annoncer la panne, ne pas appeler une simulation « live » ; passer au code et rejouer le diagramme.",
    ],
  },
  {
    id: "code", chapter: 3, title: "La partie utile tient\ndans une route.",
    subtitle: "Le SDK gère la mécanique. Vous définissez la politique.",
    seconds: 120, speaker: "A", cue: "Montrer trois points d’extension",
    notes: [
      "Repérer streamText, tools, prepareStep et stopWhen. selectedModel représente un modèle AI SDK compatible avec les appels d’outils ; le snippet est un extrait simplifié, pas un fichier autonome à copier-coller.",
      "Dans le dépôt : src/app/api/chat/route.ts pour la route ; src/lib/loop.ts pour la boucle ; src/lib/tools.ts pour les schémas et contrôles ; src/components/demo.tsx pour chat et carte.",
      "Le dernier appel autorisé est sans outil pour laisser une place à la synthèse. L’application contrôle aussi un timeout et un plafond de sortie par appel.",
      "Notre contrat de démo borne six appels au modèle, pas un budget monétaire garanti. Les entrées, les parallélisations et le tarif du modèle comptent aussi.",
    ],
  },
  {
    id: "patterns", chapter: 4, title: "Une mécanique.\nPlusieurs stratégies.",
    subtitle: "La boucle est le moteur ; les patterns organisent ses décisions.",
    seconds: 180, speaker: "B", cue: "Comparer, sans hiérarchie artificielle",
    notes: [
      "ReAct entrelace raisonnement, action et observation. Une boucle de tool calling peut être ReAct-like sans exposer de chaîne de pensée ni reproduire exactement l’article.",
      "Plan-and-Execute sépare planification et exécution, avec replanification possible. L’exécuteur peut lui-même utiliser une boucle d’outils.",
      "ReWOO prépare un plan avec des références aux résultats futurs (#E1, #E2), exécute les dépendances, puis synthétise. Ce n’est pas « sans outils » ni « sans observations du tout ».",
      "Reflexion ajoute une évaluation et une mémoire textuelle entre des tentatives. Ce n’est pas juste demander « vérifie ta réponse » ni mettre à jour les poids du modèle.",
      "Ces patterns peuvent se combiner. Choisir selon dépendances, retours imprévus, coût, latence et besoin de contrôle, pas selon un classement de sophistication.",
    ],
  },
  {
    id: "retenir", chapter: 4, title: "Le modèle choisit.\nVous concevez les limites.",
    subtitle: "Une boucle utile est une boucle observable, bornée et vérifiable.",
    seconds: 60, speaker: "Duo", cue: "Trois idées à emporter",
    notes: [
      "A : « Un appel structuré, une exécution contrôlée, une observation réinjectée. »",
      "B : « Le contexte se construit ; il ne se confond pas avec ce que voit l’utilisateur. »",
      "Ensemble : « Commencez avec peu d’outils, une limite de steps et une trace réelle. Le framework ne décide pas de votre politique produit. »",
    ],
  },
  {
    id: "questions", chapter: 5, title: "À vous de prendre\nles commandes.",
    subtitle: "Quel premier outil donneriez-vous à votre application ?",
    seconds: 120, speaker: "Duo", cue: "Deux minutes de questions",
    notes: [
      "Relancer si besoin : « Quelle action laisseriez-vous décider au modèle ? Laquelle doit absolument rester déterministe ? »",
      "Garder les comparaisons de fournisseurs et les détails de facturation pour après le talk.",
      "Les références sont accessibles ici et dans le README. Le dépôt contient la vraie route de démo et ses limites, pas une promesse de produit prêt pour la production.",
    ],
  },
] as const;

export const sources = [
  { label: "AI SDK · tool calling", url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling" },
  { label: "AI SDK · contrôle de boucle", url: "https://ai-sdk.dev/docs/agents/loop-control" },
  { label: "AI SDK · modèles et fournisseurs", url: "https://ai-sdk.dev/docs/ai-sdk-core/provider-management" },
  { label: "ReAct · Yao et al.", url: "https://arxiv.org/abs/2210.03629" },
  { label: "Plan-and-Execute · architectures", url: "https://www.langchain.com/blog/planning-agents" },
  { label: "ReWOO · Xu et al.", url: "https://arxiv.org/abs/2305.18323" },
  { label: "Reflexion · Shinn et al.", url: "https://arxiv.org/abs/2303.11366" },
];

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function slideStart(index: number) {
  return slides.slice(0, index).reduce((total, slide) => total + slide.seconds, 0);
}
