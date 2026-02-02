import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

title: "Ruta del Sabor",
  description: "Tu bitácora gastronómica en Toluca",
    manifest: "/manifest.json",
      appleWebApp: {
  capable: true,
    statusBarStyle: "black-translucent",
      title: "Ruta del Sabor",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0B1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-base text-primary font-inter bg-space`}
      >
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
