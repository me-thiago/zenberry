import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/src/contexts/cart-context";
import { AuthProvider } from "@/src/contexts/auth-context";
import { QueryProvider } from "@/src/providers/query-provider";
import { ToastProvider } from "@/src/providers/toast-provider";
import { ChatbotProvider } from "@/src/contexts/chatbot-context";
import { getAuthToken } from "@/src/services/server/auth-service";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenberry",
  description: "CBD and THC products e-commerce platform",
  icons: {
    icon: [
      {
        url: "/favicon-light.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAuthToken();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider initialToken={token}>
            <CartProvider>
              <ChatbotProvider>
                {children}
                <ToastProvider />
              </ChatbotProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
