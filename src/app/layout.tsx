import { ApolloClientProvider } from "@/shared/providers/ApolloClientProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { ToastProvider } from "@/shared/providers/ToastProvider";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "МесАгат",
    template: "%s | МесАгат",
  },
  description:
    "Secure messenger with groups, direct messages, and optional end-to-end encryption.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={GeistSans.variable}>
        <ApolloClientProvider>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
            >
              <ToastProvider />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
