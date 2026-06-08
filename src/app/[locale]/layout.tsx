import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import "@/styles/globals.css";
import SiteLayout from "@/components/layout/SiteLayout";

import { ThemeProvider } from "@/components/ThemeProvider";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <SiteLayout>
              {children}
            </SiteLayout>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
