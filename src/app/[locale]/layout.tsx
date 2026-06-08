import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import "@/styles/globals.css";
import "@/styles/globals.css";
import SiteLayout from "@/components/layout/SiteLayout";

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
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SiteLayout>
            {children}
          </SiteLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}