export const MAX_STEPS = 6;
export const MAX_MESSAGES = 40;
export const MAX_REQUEST_BYTES = 160_000;
export const MAX_PROMPT_CHARACTERS = 2_000;

export type ToolName = "searchTrains" | "checkConnections" | "showItinerary";

export function allowedTools(state: {
  stepNumber: number;
  searched: boolean;
  verified: boolean;
  mapPrepared: boolean;
}): ToolName[] {
  if (state.mapPrepared || state.stepNumber >= MAX_STEPS - 1) return [];
  if (!state.searched) return ["searchTrains"];
  if (!state.verified) return ["searchTrains", "checkConnections"];
  return ["searchTrains", "checkConnections", "showItinerary"];
}
