import type { Metadata } from 'next';
import { poppins, inter, greatVibes, allura, dancingScript, pacifico } from '@/lib/fonts';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { getBaseUrl } from '@/lib/base-url';
import '@/styles/globals.scss';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Професионални недвижими имоти в Бургас',
  description:
    'Намерете своя идеален имот в Бургас. Апартаменти, къщи, вили и бизнес имоти за продажба и наем.',
  keywords: 'недвижими имоти, Бургас, апартаменти, къщи, вили, продажба, наем',
  icons: {
    icon: '/Red Logo.jpg',
    apple: [
      { url: `${baseUrl}/Red Logo.jpg`, sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Broker Bulgaria',
    // When user adds to home screen, it will open at the base URL
  },
  openGraph: {
    type: 'website',
    locale: 'bg_BG',
    url: baseUrl,
    siteName: 'Broker Bulgaria',
    title: 'Професионални недвижими имоти в Бургас',
    description: 'Намерете своя идеален имот в Бургас. Апартаменти, къщи, вили и бизнес имоти за продажба и наем.',
    images: [
      {
        url: `${baseUrl}/Red Logo.jpg`,
        width: 1200,
        height: 630,
        alt: 'Broker Bulgaria',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Професионални недвижими имоти в Бургас',
    description: 'Намерете своя идеален имот в Бургас. Апартаменти, къщи, вили и бизнес имоти за продажба и наем.',
    images: [`${baseUrl}/Red Logo.jpg`],
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" className={`${poppins.variable} ${inter.variable} ${greatVibes.variable} ${allura.variable} ${dancingScript.variable} ${pacifico.variable}`}>
      <body>
        <I18nProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}







