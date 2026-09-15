import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StampFlow — Tampon dateur & signature PDF en ligne",
  description:
    "Apposez un tampon dateur ou une signature sur vos PDF, 100% dans votre navigateur. Aucun fichier n'est jamais envoyé à un serveur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
