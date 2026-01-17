import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactBroker } from '@/features/home/components/ContactBroker';

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <ContactBroker />
      </main>
      <Footer />
    </>
  );
}





















