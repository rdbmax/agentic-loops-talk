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
    seconds: 60, speaker: "Duo",
  },
  {
    id: "montre", chapter: 0, title: "L'interaction humaine",
    subtitle: "",
    seconds: 60, speaker: "Duo",
  },
  {
    id: "calendrier", chapter: 0, title: "Une interaction plus complexe",
    subtitle: "",
    seconds: 60, speaker: "Duo",
  },
  {
    id: "outil", chapter: 1, title: "Comment déclarer un outil ?",
    subtitle: "Un nom, une description, deux schémas et une fonction d’exécution.",
    seconds: 60, speaker: "A",
  },
  {
    id: "boucle", chapter: 1, title: "La boucle, sans magie.",
    subtitle: "Le modèle propose. Votre code garde les commandes.",
    seconds: 90, speaker: "A",
  },
  {
    id: "contraintes", chapter: 1, title: "Des outils. Pas carte blanche.",
    subtitle: "Les capacités autorisées évoluent avec l’état de la boucle.",
    seconds: 60, speaker: "A",
  },
  {
    id: "contexte", chapter: 1, title: "La mémoire du chat ?\nUn contexte construit.",
    subtitle: "Historique visible, état applicatif et contexte modèle sont trois choses différentes.",
    seconds: 90, speaker: "B",
  },
  {
    id: "cache", chapter: 1, title: "Réutiliser le préfixe.\nPas la réponse.",
    subtitle: "Si disponible, le prompt caching réutilise du calcul d’entrée sur un contexte stable.",
    seconds: 90, speaker: "B",
  },
  {
    id: "compaction", chapter: 1, title: "Alléger le contexte.\nGarder la conversation.",
    subtitle: "Deux vues d’une même histoire, pour deux destinataires différents.",
    seconds: 90, speaker: "B",
  },
  {
    id: "interface", chapter: 1, title: "Un outil peut aussi\nfaire bouger l’interface.",
    subtitle: "Une action UI typée, plutôt qu’une instruction cachée dans le texte.",
    seconds: 90, speaker: "A",
  },
  {
    id: "raisonnement", chapter: 1, title: "Observer les décisions.\nPas lire les pensées.",
    subtitle: "Le raisonnement aide à choisir une action. Il ne remplace pas sa vérification.",
    seconds: 90, speaker: "B",
  },
  {
    id: "assistants", chapter: 2, title: "Vous utilisez déjà\nces boucles.",
    subtitle: "Le passage du chatbot à l’assistant capable d’agir.",
    seconds: 180, speaker: "Duo",
  },
  {
    id: "demo", chapter: 3, title: "Prochain arrêt :\nla Voie Lactée.",
    subtitle: "Une vraie boucle. Des trains fictifs. Des correspondances à vérifier.",
    seconds: 300, speaker: "Duo",
  },
  {
    id: "code", chapter: 3, title: "La partie utile tient\ndans une route.",
    subtitle: "Le SDK gère la mécanique. Vous définissez la politique.",
    seconds: 120, speaker: "A",
  },
  {
    id: "patterns", chapter: 4, title: "Une mécanique.\nPlusieurs stratégies.",
    subtitle: "La boucle est le moteur ; les patterns organisent ses décisions.",
    seconds: 180, speaker: "B",
  },
  {
    id: "retenir", chapter: 4, title: "Le modèle choisit.\nVous concevez les limites.",
    subtitle: "Une boucle utile est une boucle observable, bornée et vérifiable.",
    seconds: 60, speaker: "Duo",
  },
  {
    id: "questions", chapter: 5, title: "À vous de prendre\nles commandes.",
    subtitle: "Quel premier outil donneriez-vous à votre application ?",
    seconds: 120, speaker: "Duo",
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
