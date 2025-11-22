import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TanStackProvider from "@/components/tan-stack-provider";
import { Toaster } from "sonner";
import ClientRoot from "@/components/client-root";
import ScrollToTop from "@/components/scroll-top";
import StreamClientProvider from "@/components/providers/StreamClientProvider";
import "@stream-io/video-react-sdk/dist/css/styles.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillWokz - Accelerateur de carriere",
  description:
    "Préparez-vous aux entretiens techniques avec SkillWokz - Améliorez vos hard et soft skills et progresez dans votre carriere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TanStackProvider>
            <ClientRoot>
              <StreamClientProvider>
                {children}
              </StreamClientProvider>
            </ClientRoot>
          </TanStackProvider>
          <Toaster />
          <ScrollToTop/>
        </ThemeProvider>
      </body>
    </html>
  );
}
