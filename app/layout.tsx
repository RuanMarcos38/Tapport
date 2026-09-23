import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tapport",
  description: "SaaS multiempresa para operação portuária."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
