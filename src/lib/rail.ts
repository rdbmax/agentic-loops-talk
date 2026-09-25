export const moods = ["calme", "aventure", "gourmand"] as const;
export const destinationIds = ["aurore", "pelagia", "sirocco", "sylve", "luna", "nacre"] as const;
export type DestinationId = (typeof destinationIds)[number];

export type Destination = {
  id: DestinationId;
  name: string;
  line: string;
  mood: (typeof moods)[number];
  price: number;
  hours: number;
  changes: number;
  nightTrain: boolean;
  open: boolean;
  condition: string;
  description: string;
  x: number;
  y: number;
  color: string;
};

export const destinations: Destination[] = [
  { id: "aurore", name: "Aurore", line: "Boréal Express", mood: "calme", price: 790, hours: 9, changes: 1, nightTrain: true, open: true, condition: "Correspondance de 45 min à Luna Centrale. Ligne ouverte.", description: "Une cabine sous les aurores, puis le silence des lacs violets.", x: 75, y: 21, color: "#c4ee90" },
  { id: "pelagia", name: "Pélagia", line: "Train des marées", mood: "calme", price: 860, hours: 11, changes: 0, nightTrain: true, open: true, condition: "Train direct depuis la Terre. Ligne ouverte.", description: "Dormir sur les rails, se réveiller face à un océan suspendu.", x: 78, y: 73, color: "#8bcde3" },
  { id: "sirocco", name: "Sirocco", line: "Comète de nuit", mood: "aventure", price: 640, hours: 8, changes: 1, nightTrain: true, open: false, condition: "Ligne fermée : pluie de météorites. Aucun départ disponible.", description: "Des dunes cuivrées, des canyons et un train panoramique.", x: 49, y: 13, color: "#eea17d" },
  { id: "sylve", name: "Sylve", line: "Canopée Express", mood: "aventure", price: 720, hours: 7, changes: 1, nightTrain: true, open: true, condition: "Correspondance de 30 min à Luna Centrale. Ligne ouverte.", description: "Des forêts bioluminescentes au bout d’une voie suspendue.", x: 48, y: 82, color: "#b9d986" },
  { id: "luna", name: "Luna Centrale", line: "Luna Local", mood: "gourmand", price: 220, hours: 2, changes: 0, nightTrain: false, open: true, condition: "Train direct de jour. Ligne ouverte.", description: "Une escale pour goûter les meilleurs croissants lunaires.", x: 43, y: 49, color: "#d4c4fa" },
  { id: "nacre", name: "Nacre", line: "Orient stellaire", mood: "gourmand", price: 1100, hours: 13, changes: 1, nightTrain: true, open: true, condition: "Correspondance de 60 min à Luna Centrale. Ligne ouverte.", description: "Le wagon-restaurant qui traverse les anneaux de cristal.", x: 89, y: 43, color: "#f2d59c" },
];

export type SearchInput = {
  maxPrice: number;
  mood?: (typeof moods)[number];
  nightTrain?: boolean;
  directOnly?: boolean;
  destinationId?: DestinationId;
};

export function searchTrains(input: SearchInput) {
  return destinations.filter((destination) =>
    destination.price <= input.maxPrice &&
    (!input.mood || destination.mood === input.mood) &&
    (input.nightTrain === undefined || destination.nightTrain === input.nightTrain) &&
    (!input.directOnly || destination.changes === 0) &&
    (!input.destinationId || destination.id === input.destinationId),
  ).map(({ id, name, line, price, hours, changes, nightTrain, description }) => ({
    id, name, line, price, hours, changes, nightTrain, description,
    priceUnit: "crédits par personne, aller-retour ; hébergement exclu",
  }));
}

export function connectionFor(id: DestinationId) {
  const destination = destinations.find((item) => item.id === id);
  if (!destination) throw new Error("Destination inconnue.");
  return { id, available: destination.open, detail: destination.condition };
}

export type MapCommand = {
  destinationIds: DestinationId[];
  status: "command-prepared";
};

export const suggestedPrompts = [
  "Un week-end au calme en train de nuit, moins de 900 crédits aller-retour par personne. Propose deux destinations et affiche les trajets.",
  "Et sans correspondance ?",
  "Je veux une aventure à Sirocco en train de nuit, budget 800 crédits aller-retour. Vérifie la ligne et affiche un trajet disponible.",
];
