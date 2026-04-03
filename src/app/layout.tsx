import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";

export const metadata: Metadata = {
  title: "TenantHub - Tenant Portal",
  description:
    "Modern tenant portal for building management - submit maintenance requests, pay rent, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
