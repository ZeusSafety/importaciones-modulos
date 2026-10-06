import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { SCRIPT_TEMA_INICIAL } from "@/modules/shared/presentation/tema/constantesTema";
import { ProveedorNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { PantallaCarga } from "@/modules/shared/presentation/ui/PantallaCarga";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Importaciones | Zeus Safety", template: "%s | Zeus Safety" },
  description: "Sistema de importaciones Zeus Safety, organizado por módulos.",
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#002D5A",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <PantallaCarga />
        <ProveedorNotificaciones>{children}</ProveedorNotificaciones>
      </body>
    </html>
  );
}
