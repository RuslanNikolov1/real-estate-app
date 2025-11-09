import type { Metadata } from 'next';
import { poppins, inter, greatVibes, allura, dancingScript, pacifico } from '@/lib/fonts';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Професионални недвижими имоти в Бургас',
  description:
    'Намерете своя идеален имот в Бургас. Апартаменти, къщи, вили и бизнес имоти за продажба и наем.',
  keywords: 'недвижими имоти, Бургас, апартаменти, къщи, вили, продажба, наем',
  icons: {
    icon: '/Red Logo.jpg',
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
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}







