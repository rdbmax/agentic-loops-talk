import { Presentation } from "@/components/presentation";

export const dynamic = "force-dynamic";

export default function Home() {
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());
  return <Presentation configured={configured} />;
}
