import { ApolloClientProvider } from "@/shared/providers/ApolloClientProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { ToastProvider } from "@/shared/providers/ToastProvider";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Messenger Arat",
  description: "KYKYSHKA",
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
