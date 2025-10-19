import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TanStackProvider from "@/components/tan-stack-provider";
import { Toaster } from "sonner";
import ClientRoot from "@/components/client-root";
import { RouteGuard } from "@/components/protected-routes";
import ScrollToTop from "@/components/scroll-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TurboIntMax - Accelerateur de carriere",
  description:
    "Préparez-vous aux entretiens techniques avec TurboIntMax - Améliorez vos hard et soft skills et progresez dans votre carriere",
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
              <RouteGuard>{children}</RouteGuard>
            </ClientRoot>
          </TanStackProvider>
          <Toaster />
          <ScrollToTop/>
        </ThemeProvider>
      </body>
    </html>
  );
}
