import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import AuthGuard from "@/components/AuthGuard";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "TenantHub - Tenant Portal",
  description:
    "Modern tenant portal for building management - submit maintenance requests, pay rent, and more.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full">
        <AppProvider>
          <AuthGuard>{children}</AuthGuard>
          <ChatBot />
        </AppProvider>
      </body>
    </html>
  );
}
