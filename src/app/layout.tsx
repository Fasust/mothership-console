import { Inter, VT323 } from "next/font/google";
import type React from "react";
import "./globals.css";
import { ProviderRegistry } from "./provider-registry";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Mothership",
  description: "Interactive maps for Mothership",
  generator: "v0.dev",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${vt323.variable} font-mono`}>
        <ProviderRegistry>{children}</ProviderRegistry>
      </body>
    </html>
  );
}
