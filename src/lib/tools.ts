import { tool } from "ai";
import { z } from "zod";
import { allowedTools } from "./policy";
import { connectionFor, destinationIds, moods, searchTrains, type DestinationId, type MapCommand } from "./rail";

const idsSchema = z.array(z.enum(destinationIds)).min(1).max(3);

export function createRailTools() {
  const candidates = new Set<DestinationId>();
  const verified = new Set<DestinationId>();
  let mapPrepared = false;

  function requireCandidate(id: DestinationId) {
    if (!candidates.has(id)) {
      throw new Error(`Recherchez ${id} pendant ce tour avant de vérifier sa ligne.`);
    }
  }

  const tools = {
    searchTrains: tool({
      description: "Recherche dans le catalogue ferroviaire fictif depuis la Terre. Prix aller-retour par personne, hors hébergement. Ne garantit PAS que la ligne est ouverte : appeler checkConnections ensuite.",
      inputSchema: z.object({
        maxPrice: z.number().int().min(1).max(10_000).describe("Budget maximum aller-retour en crédits."),
        mood: z.enum(moods).optional(),
        nightTrain: z.boolean().optional().describe("true pour un train de nuit uniquement ; omettre pour indifférent."),
        directOnly: z.boolean().optional(),
        destinationId: z.enum(destinationIds).optional().describe("Seulement si une destination précise est demandée."),
      }),
      execute: async (input) => {
        const results = searchTrains(input);
        results.forEach((result) => candidates.add(result.id));
        return { fictional: true, departure: "Terre", results };
      },
    }),
    checkConnections: tool({
      description: "Vérifie l’ouverture des lignes et les correspondances de 1 à 3 destinations issues d’une recherche de ce tour. Peut révéler une ligne fermée.",
      inputSchema: z.object({ destinationIds: idsSchema }),
      execute: async ({ destinationIds: ids }) => {
        ids.forEach(requireCandidate);
        const results = [...new Set(ids)].map(connectionFor);
        results.forEach((result) => {
          if (result.available) verified.add(result.id);
          else verified.delete(result.id);
        });
        return { fictional: true, results };
      },
    }),
    showItinerary: tool({
      description: "Prépare une commande UI affichant les trajets de 1 à 3 destinations vérifiées et ouvertes pendant ce tour. Ne réserve rien et ne confirme pas que le navigateur a rendu la carte.",
      inputSchema: z.object({ destinationIds: idsSchema }),
      execute: async ({ destinationIds: ids }): Promise<MapCommand> => {
        for (const id of ids) {
          if (!verified.has(id)) throw new Error(`Le trajet ${id} n’a pas été vérifié ouvert pendant ce tour.`);
        }
        mapPrepared = true;
        return { destinationIds: [...new Set(ids)], status: "command-prepared" };
      },
    }),
  };

  return {
    tools,
    activeTools: (stepNumber: number) => allowedTools({
      stepNumber,
      searched: candidates.size > 0,
      verified: verified.size > 0,
      mapPrepared,
    }),
  };
}

export type RailTools = ReturnType<typeof createRailTools>["tools"];
