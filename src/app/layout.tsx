import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dans la boucle — un talk sur les outils agentiques",
  description: "30 minutes pour comprendre et développer une boucle d’outils. Une démo ferroviaire intergalactique, quel que soit le modèle compatible choisi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
