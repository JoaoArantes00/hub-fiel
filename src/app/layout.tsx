import type { Metadata } from "next";
import "./globals.css";

// Nome oficial, identidade visual e tipografia ainda estão em aberto
// (PROJECT_SPEC §58): título provisório e fontes do sistema.
export const metadata: Metadata = {
  title: "Plataforma Corinthiana",
  description: "Acervo digital independente sobre o Corinthians.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
