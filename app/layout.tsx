import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardInsetWatcher } from "@/components/layout/keyboard-inset-watcher";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SIGO Oficina",
  description: "Gestão de ordens de serviço, estoque, agenda e financeiro para oficinas de eletrodomésticos.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIGO Oficina",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#202522",
  // Sem isso, o teclado virtual simplesmente sobrepõe a tela (o viewport não
  // encolhe) — qualquer modal ancorado embaixo (como os diálogos no celular)
  // fica escondido atrás do teclado assim que um campo de texto é focado.
  interactiveWidget: "resizes-content",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("sigo-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <KeyboardInsetWatcher />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
