'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NeighborhoodCard } from './components/NeighborhoodCard';
import { Input } from '@/components/ui/Input';
import { MagnifyingGlass, MapPin } from '@phosphor-icons/react';
import styles from './NeighborhoodsPage.module.scss';

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  location: {
    lat: number;
    lng: number;
  };
  characteristics: string[];
  amenities: string[];
  propertyTypes: string[];
  averagePrice: {
    sale: number;
    rent: number;
  };
  distanceFromCenter: string;
  transport: string[];
}

const neighborhoods: Neighborhood[] = [
  {
    id: '1',
    name: 'Център',
    description: 'Сърцето на Бургас с богата история и модерна инфраструктура',
    longDescription:
      'Центърът на Бургас е динамичен квартал, който съчетава историческото наследство с модерния начин на живот. Тук се намират основните търговски улици, административни сгради и културни институции. Кварталът предлага отлична транспортна свързаност и близост до всички важни обекти.',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
    location: {
      lat: 42.5048,
      lng: 27.4626,
    },
    characteristics: [
      'Исторически център',
      'Търговска зона',
      'Административен център',
      'Пешеходни зони',
      'Културни обекти',
    ],
    amenities: [
      'Търговски центрове',
      'Ресторанти и кафенета',
      'Банки и офисни сгради',
      'Театър и музеи',
      'Паркове и градини',
    ],
    propertyTypes: ['Апартаменти', 'Офисни пространства', 'Магазини'],
    averagePrice: {
      sale: 1500,
      rent: 500,
    },
    distanceFromCenter: '0 км',
    transport: ['Автобуси', 'Такси', 'Пешеходна зона'],
  },
  {
    id: '2',
    name: 'Морска градина',
    description: 'Премиум квартал на първа линия море с луксозни вили и апартаменти',
    longDescription:
      'Морска градина е един от най-престижните квартали в Бургас, разположен непосредствено до морето. Кварталът предлага невероятни изгледи към Черно море и достъп до плажа. Тук се намират най-луксозните жилищни комплекси, вили и апартаменти с изглед към морето.',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0',
    location: {
      lat: 42.5100,
      lng: 27.4800,
    },
    characteristics: [
      'Първа линия море',
      'Луксозни имоти',
      'Изглед към морето',
      'Тих и спокоен',
      'Премиум локация',
    ],
    amenities: [
      'Плаж',
      'Ресторанти на морето',
      'Парк Морска градина',
      'Спортни съоръжения',
      'Марина',
    ],
    propertyTypes: ['Вила', 'Апартаменти', 'Пентхауси'],
    averagePrice: {
      sale: 2500,
      rent: 800,
    },
    distanceFromCenter: '1 км',
    transport: ['Автобуси', 'Пешеходна зона', 'Велосипедни пътеки'],
  },
  {
    id: '3',
    name: 'Славейков',
    description: 'Семеен квартал с добри училища и спокойна атмосфера',
    longDescription:
      'Славейков е идеален квартал за семейства с деца. Кварталът предлага спокойна жилищна среда, отлични училища и детски градини, както и много зелени площи. Тук преобладават къщи с дворове и семейни апартаменти. Кварталът е добре свързан с центъра и предлага всички необходими услуги.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    location: {
      lat: 42.5200,
      lng: 27.4500,
    },
    characteristics: [
      'Семеен квартал',
      'Зелени зони',
      'Добри училища',
      'Спокойна атмосфера',
      'Къщи с дворове',
    ],
    amenities: [
      'Училища',
      'Детски градини',
      'Паркове',
      'Супермаркети',
      'Аптеки',
    ],
    propertyTypes: ['Къщи', 'Апартаменти', 'Таунхауси'],
    averagePrice: {
      sale: 1200,
      rent: 400,
    },
    distanceFromCenter: '2 км',
    transport: ['Автобуси', 'Такси'],
  },
  {
    id: '4',
    name: 'Лозово',
    description: 'Модерен квартал с нови жилищни комплекси и отлична инфраструктура',
    longDescription:
      'Лозово е един от най-модерните квартали в Бургас, който се развива бързо. Кварталът предлага нови жилищни комплекси с модерна архитектура и отлична инфраструктура. Тук се намират нови търговски центрове, ресторанти и развлекателни заведения. Кварталът е идеален за млади професионалисти и семейства.',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f51c',
    location: {
      lat: 42.4900,
      lng: 27.4400,
    },
    characteristics: [
      'Модерна архитектура',
      'Нови комплекси',
      'Развиващ се квартал',
      'Отлична инфраструктура',
      'Млада общност',
    ],
    amenities: [
      'Търговски центрове',
      'Ресторанти',
      'Фитнес центрове',
      'Паркове',
      'Училища',
    ],
    propertyTypes: ['Апартаменти', 'Таунхауси', 'Офисни пространства'],
    averagePrice: {
      sale: 1400,
      rent: 450,
    },
    distanceFromCenter: '3 км',
    transport: ['Автобуси', 'Такси', 'Велосипедни пътеки'],
  },
  {
    id: '5',
    name: 'Сарафово',
    description: 'Приморски курортен квартал с плаж и марина',
    longDescription:
      'Сарафово е живописен приморски квартал, разположен на юг от центъра на Бургас. Кварталът предлага прекрасен плаж, марина за яхти и спокойна курортна атмосфера. Тук се намират вили, апартаменти и хотели, които привличат както местни, така и чуждестранни инвеститори.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    location: {
      lat: 42.5500,
      lng: 27.5000,
    },
    characteristics: [
      'Приморски квартал',
      'Курортна зона',
      'Плаж и марина',
      'Туристическа зона',
      'Инвестиционен потенциал',
    ],
    amenities: [
      'Плаж',
      'Марина',
      'Ресторанти',
      'Хотели',
      'Развлекателни заведения',
    ],
    propertyTypes: ['Вила', 'Апартаменти', 'Хотели', 'Земя'],
    averagePrice: {
      sale: 2000,
      rent: 600,
    },
    distanceFromCenter: '8 км',
    transport: ['Автобуси', 'Такси', 'Автомобил'],
  },
  {
    id: '6',
    name: 'Изгрев',
    description: 'Планински квартал с чист въздух и изглед към планината',
    longDescription:
      'Изгрев е спокоен квартал, разположен в подножието на планината. Кварталът предлага чист въздух, прекрасни изгледи и спокойна жилищна среда. Тук преобладават къщи с големи дворове и градини. Кварталът е идеален за хора, които търсят спокойствие и близост до природата.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    location: {
      lat: 42.4800,
      lng: 27.4200,
    },
    characteristics: [
      'Планинска зона',
      'Чист въздух',
      'Спокойна атмосфера',
      'Къщи с дворове',
      'Близост до природата',
    ],
    amenities: [
      'Паркове',
      'Градини',
      'Пешеходни пътеки',
      'Супермаркети',
      'Аптеки',
    ],
    propertyTypes: ['Къщи', 'Земя', 'Вила'],
    averagePrice: {
      sale: 1000,
      rent: 350,
    },
    distanceFromCenter: '4 км',
    transport: ['Автобуси', 'Такси', 'Автомобил'],
  },
  {
    id: '7',
    name: 'Меден рудник',
    description: 'Търговски квартал с висок трафик и бизнес възможности',
    longDescription:
      'Меден рудник е оживен търговски квартал с висок трафик и отлични бизнес възможности. Кварталът предлага много магазини, ресторанти и услуги. Тук се намират както жилищни, така и търговски имоти. Кварталът е идеален за инвеститори, които търсят търговски обекти или офисни пространства.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    location: {
      lat: 42.5000,
      lng: 27.4300,
    },
    characteristics: [
      'Търговска зона',
      'Висок трафик',
      'Бизнес възможности',
      'Развита инфраструктура',
      'Достъпност',
    ],
    amenities: [
      'Магазини',
      'Ресторанти',
      'Банки',
      'Офисни сгради',
      'Паркинг',
    ],
    propertyTypes: ['Магазини', 'Офисни пространства', 'Апартаменти'],
    averagePrice: {
      sale: 1300,
      rent: 420,
    },
    distanceFromCenter: '2.5 км',
    transport: ['Автобуси', 'Такси', 'Пешеходна зона'],
  },
  {
    id: '8',
    name: 'Индустриална зона',
    description: 'Бизнес квартал с складове и производствени обекти',
    longDescription:
      'Индустриалната зона е специализиран квартал за бизнес и производство. Тук се намират складове, производствени обекти и логистични центрове. Кварталът предлага отлична транспортна свързаност и достъп до магистрали. Тук се намират и някои жилищни комплекси за работниците в зоната.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
    location: {
      lat: 42.4600,
      lng: 27.4000,
    },
    characteristics: [
      'Бизнес зона',
      'Производствени обекти',
      'Складове',
      'Логистика',
      'Транспортна свързаност',
    ],
    amenities: [
      'Складове',
      'Производствени обекти',
      'Офисни сгради',
      'Паркинг',
      'Ресторанти',
    ],
    propertyTypes: ['Складове', 'Производствени обекти', 'Офисни пространства'],
    averagePrice: {
      sale: 800,
      rent: 300,
    },
    distanceFromCenter: '5 км',
    transport: ['Автобуси', 'Такси', 'Автомобил', 'Товарен транспорт'],
  },
];

export function NeighborhoodsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNeighborhoods = neighborhoods.filter((neighborhood) =>
    neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    neighborhood.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.neighborhoodsPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.header}
          >
            <h1 className={styles.title}>Квартали в Бургас</h1>
            <p className={styles.subtitle}>
              Открийте уникалните характеристики и възможности на всеки квартал в Бургас
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.searchSection}
          >
            <div className={styles.searchWrapper}>
              <MagnifyingGlass size={18} className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Търсене по име или описание на квартал..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </motion.div>

          <div className={styles.neighborhoodsGrid}>
            {filteredNeighborhoods.map((neighborhood, index) => (
              <NeighborhoodCard
                key={neighborhood.id}
                neighborhood={neighborhood}
                index={index}
                onSelect={() => {
                  // TODO: Open detail modal or navigate to detail page
                  console.log('Selected neighborhood:', neighborhood);
                }}
              />
            ))}
          </div>

          {filteredNeighborhoods.length === 0 && (
            <div className={styles.noResults}>
              <MapPin size={48} />
              <p>Няма намерени квартали.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

