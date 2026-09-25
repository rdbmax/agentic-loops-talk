import type { InferUITools, UIMessage } from "ai";
import type { ToolName } from "./policy";
import type { RailTools } from "./tools";

export type StepTrace = {
  number: number;
  state: "running" | "done";
  activeTools: ToolName[];
  messageCount: number;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  finishReason?: string;
};

export type DemoMessage = UIMessage<
  never,
  { step: StepTrace; notice: { message: string } },
  InferUITools<RailTools>
>;
