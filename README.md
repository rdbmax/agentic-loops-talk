# Dans la boucle

Mini-site de présentation en français : **comprendre et développer des boucles
d’outils agentiques**, à deux voix, en **30 minutes**. Le fil rouge est
**Voie Lactée**, une agence de voyages intergalactiques **en train**.

Next.js 16, React 19 et AI SDK 7. Les références d’API correspondent
aux versions verrouillées dans `package-lock.json`.

## Démarrer

Node.js 22 recommandé, npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Ouvrir <http://127.0.0.1:3000>. La présentation fonctionne sans clé ; **le chat
live reste indisponible tant qu’un modèle n’est pas configuré**. Aucune simulation
n’est substituée à un appel en échec. Les polices, illustrations, diagrammes et
la carte ne nécessitent aucun service tiers.

`npm run build && npm start` permet de présenter une version de production.
Les scripts serveur écoutent uniquement sur `127.0.0.1` : c’est une **démo locale**,
pas un service public authentifié.

## Configurer la vraie démo

La **présentation et la boucle** ne supposent aucun fournisseur spécifique.
Pour la démo live, la route HTTP utilise le provider officiel [OpenAI de l’AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/openai)
et appelle directement l’API OpenAI. Le modèle par défaut est `gpt-4.1-mini` ;
vous pouvez le remplacer par un modèle OpenAI compatible avec les capacités
requises. Cela ne rend pas la présentation dépendante d’OpenAI.

Dans `.env.local`, renseigner la clé **côté serveur** et, facultativement, un autre
identifiant de modèle :

```sh
OPENAI_API_KEY=votre-cle-api-openai
DEMO_MODEL_ID=gpt-4.1-mini
```

Le modèle doit être **compatible streaming et tool calling**. Copier `.env.example`
vers `.env.local` pour partir du modèle de configuration ; si `.env.local` existe
déjà, **modifier ses variables** plutôt que d’écraser le fichier. Ne jamais mettre
la clé dans `NEXT_PUBLIC_*` ni la commiter. Redémarrer Next.js après configuration.

Pour utiliser **un autre fournisseur AI SDK**, remplacer uniquement
`openai(modelId)` dans `src/app/api/chat/route.ts` par une instance de son provider,
et adapter les variables d’environnement et la vérification de configuration de
`src/app/page.tsx`. `src/lib/loop.ts` reçoit un `LanguageModel` AI SDK : outils,
politique et interface n’ont pas besoin d’être réécrits.
Certains modèles ne prennent pas en charge tous les réglages, outils ou métriques
de cache ; vérifier les capacités de celui retenu.

**« Configuration présente » ne teste pas la connexion.** Répéter sur votre
compte avant le talk. Les demandes et leur historique sont transmis au service
choisi à chaque envoi : utiliser des données fictives et tenir compte des coûts.
Aucun appel au modèle n’est déclenché au chargement du site.

## Déroulé proposé

| Temps | Séquence | Intention |
| --- | --- | --- |
| 00:00–03:00 | Promesse, montre, calendrier | Passer d’une question aux observations nécessaires |
| 03:00–14:00 | Un diagramme qui s’enrichit | Boucle, contraintes, contexte, cache, compaction, UI, raisonnement |
| 14:00–17:00 | Assistants de code et chats généralistes | Reconnaître la boucle au quotidien |
| 17:00–22:00 | Voie Lactée en direct | Chat, outils et carte ; réagir à une ligne fermée |
| 22:00–24:00 | Extrait de code | Montrer contrat, politique et limites |
| 24:00–28:00 | Patterns et synthèse | Situer ReAct, Plan-and-Execute, ReWOO, Reflexion |
| 28:00–30:00 | Questions | Relier le mécanisme aux applications de l’équipe |

Les 16 écrans, durées et voix A/B sont dans `src/lib/talk.ts`.
A et B sont des rôles à vous répartir. La partie « sous le capot » est dense :
répéter avec le chrono.

### Ce qui a été challengé

1. **Une seule boucle progressive**, pas un inventaire. Distinguer tour utilisateur,
   step du modèle et exécution d’outil.
2. **Le modèle propose ; le code exécute.** Un schéma ou un prompt ne remplace pas
   validation métier, permissions et contrôle des effets.
3. **Le contexte n’est pas la conversation visible.** Dans cette démo,
   l’application reconstruit le contexte à chaque tour et entre les steps.
   D’autres API permettent de référencer un état côté service : aucun transport
   particulier de l’historique n’est universel.
4. **Le cache n’est ni une réponse stockée, ni une mémoire.** La réutilisation
   dépend du modèle et du fournisseur ; s’il est disponible, le préfixe, les
   seuils et la durée peuvent influer sur les hits. Modifier les outils peut
   réduire la réutilisation ; consulter les métriques quand elles existent.
5. **La compaction est avec perte.** Garder l’historique produit séparément,
   préserver contraintes et décisions, ne pas casser les couples appel/résultat.
6. **Une commande UI n’est pas un acquittement.** Le serveur prépare la commande,
   React la rend. Un outil exécuté dans le navigateur doit renvoyer son résultat
   avant une reprise de boucle qui dépend de cet effet.
7. **La trace n’est pas une lecture des pensées.** Événements observés seulement.
   Aucun mode de raisonnement explicitement activé.
8. **Les patterns sont des stratégies combinables.** Une boucle peut être
   ReAct-like sans reproduire le format de l’article. Plan-and-Execute peut
   contenir des boucles. ReWOO prépare les dépendances entre résultats.
   Reflexion ajoute évaluation et mémoire entre essais, sans entraîner les poids.

## Présenter et répéter

| Commande | Action |
| --- | --- |
| `←` / `→`, Page précédente / suivante, espace | Naviguer |
| Début / Fin | Premier / dernier écran |
| `M` | Sommaire avec timings |
| `F` | Plein écran si le navigateur le permet |
| Chrono en haut | Démarrer, pause, réinitialiser |

Les raccourcis sont inactifs dans les champs et contrôles interactifs. Les boutons
des animations sont indépendants du passage d’écran. Les ancres, par exemple
`/#demo`, sont partageables. Le chat reste monté pendant la navigation ; un
rechargement ou « Nouvelle conversation » efface l’état. Pas de base de données
ni de persistance des conversations dans `localStorage`.

Le site respecte `prefers-reduced-motion` et s’adapte aux petites tailles d’écran.
Avant le talk, vérifier la lisibilité du code et des traces depuis le fond de la salle.

## Scénario de démo

Les pastilles **remplissent le champ** ; seul Envoyer déclenche l’appel.

1. Deux destinations calmes en train de nuit, sous 900 crédits A/R par personne :
   le catalogue contient Aurore et Pélagia.
2. « Et sans correspondance ? » dans le même chat : Pélagia est directe.
3. Nouvelle conversation, aventure à Sirocco sous 800 crédits A/R. La recherche
   trouve Sirocco, mais la vérification révèle une fermeture. Une autre recherche
   peut trouver Sylve. **La trajectoire dépend du modèle** : expliquer ou demander
   confirmation est aussi possible. Ne pas promettre une séquence mot pour mot.

Prix fictifs, par personne, aller-retour, **hors hébergement**. Horaires, lignes et
disponibilités déterministes et fictifs. Aucun service ferroviaire interrogé,
aucun billet réservé. En cas de panne du service : l’annoncer, passer au code, puis
rejouer le diagramme pédagogique — pas une exécution live de secours.

## Fonctionnement et limites

```text
React / useChat → POST /api/chat → validation + choix du modèle
  → streamText : contexte + outils autorisés
  → searchTrains : candidats du catalogue
  → checkConnections : candidats vérifiés pendant ce tour
  → showItinerary : commande UI pour les trajets vérifiés ouverts
  → synthèse sans outil
  → flux SSE : texte, outils, métriques → chat + carte + journal
```

L’enchaînement n’est pas forcé : le modèle peut demander une précision, répondre
directement ou refaire une recherche. `activeTools` varie selon les observations.
Les outils contrôlent aussi leurs préconditions à l’exécution. L’état est **isolé
par requête** : l’historique ne donne pas le droit d’afficher sans revérifier.

Limites : 6 steps, 1 200 tokens de sortie **par step**, timeout SDK total de
85 secondes, aucun retry automatique, 2 000 caractères par demande, 40 messages
et 160 000 octets par requête. Le dernier appel n’a aucun outil pour laisser une
place à la synthèse. Ce n’est pas un budget monétaire garanti.
La trace utilise les métriques du provider ou indique « non fourni ».
Un arrêt utilisateur n’annule pas les effets déjà effectués.

L’API accepte le texte et l’historique des outils connus, refuse les origines
tierces annoncées et garde les secrets côté serveur. **Cela ne remplace pas une
authentification.** Avant exposition réseau : authentification, quotas persistants,
limites de débit/concurrence, stockage et validation serveur de l’historique,
supervision des coûts et contrôle des effets. Ne pas ouvrir cette démo au public.

Cache et compaction sont **pédagogiques** : aucun cache explicite ni résumé
automatique n’est activé dans le live. La métrique de cache réel est affichée
si le modèle et son fournisseur la fournissent.

## Fichiers principaux

- `src/lib/talk.ts` : contenu, durées, notes et sources.
- `src/components/presentation.tsx` : navigation, chrono, écrans.
- `src/components/experiments.tsx` : illustrations manipulables.
- `src/app/api/chat/route.ts` : frontière HTTP et choix du modèle de la démo.
- `src/lib/loop.ts` : vraie boucle AI SDK, événements de trace.
- `src/lib/tools.ts`, `policy.ts` : contrats, préconditions, outils autorisés.
- `src/lib/rail.ts` : catalogue ferroviaire déterministe.
- `src/components/demo.tsx`, `rail-map.tsx` : chat, carte, journal.

## Vérifier

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Le modèle contrôlé est substitué **uniquement dans les tests**. Ceux-ci exécutent
les vrais outils et le streaming SDK sans service externe ; les tests navigateur
interceptent le chat avec ce flux. Ils ne prouvent ni votre accès au modèle choisi
ni sa qualité de décision : compléter avec une répétition live sur votre compte.

## Sources

- [Tool calling, AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Contrôle de boucle, AI SDK](https://ai-sdk.dev/docs/agents/loop-control)
- [Gestion des modèles et fournisseurs, AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)
- [Provider OpenAI, AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/openai)
- [ReAct, Yao et al.](https://arxiv.org/abs/2210.03629)
- [Plan-and-Execute](https://www.langchain.com/blog/planning-agents)
- [ReWOO, Xu et al.](https://arxiv.org/abs/2305.18323)
- [Reflexion, Shinn et al.](https://arxiv.org/abs/2303.11366)
