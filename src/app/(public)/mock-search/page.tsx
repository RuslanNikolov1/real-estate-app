'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const propertyTypeLabels: Record<string, string> = {
  apartments: 'Апартаменти',
  'houses-villas': 'Къщи/Вили',
  'stores-offices': 'Магазини/Офиси/Кабинети/Салони',
  'building-plots': 'Строителни парцели/Инвестиционни проекти',
  'agricultural-land': 'Земеделска земя/Лозя/Гори',
  'warehouses-industrial': 'Складове/Индустриални и стопански имоти',
  'garages-parking': 'Гаражи/Паркоместа',
  'hotels-motels': 'Хотели/Мотели',
  restaurants: 'Ресторанти',
  'replace-real-estates': 'Замяна на недвижими имоти',
  'buy-real-estates': 'Купуване на недвижими имоти',
  'other-real-estates': 'Други недвижими имоти',
};

function MockSearchContent() {
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const typeFromParams = searchParams.get('type') ?? 'all';
    setSelectedType(typeFromParams);
  }, [searchParams]);

  const typeLabel = useMemo(() => {
    if (selectedType === 'all') {
      return 'Всички имоти';
    }
    return propertyTypeLabels[selectedType] ?? selectedType;
  }, [selectedType]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f4f4',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          background: '#fff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          border: '3px solid #8C1C1C',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#8C1C1C' }}>
          Псевдо резултати за търсене
        </h1>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            background: '#FBEAEA',
            border: '1px solid #8C1C1C',
            color: '#8C1C1C',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          Текуща категория: <span>{typeLabel}</span>
        </div>
        <p style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Вие избрахте категорията <strong>{typeLabel}</strong>. Тук ще се появят реалните резултати
          от търсене, когато функционалността бъде завършена.
        </p>
        <p style={{ marginBottom: '2rem', color: '#555' }}>
          Понастоящем тази страница служи като демонстрация. Използвайте бутоните по-долу, за да се
          върнете или да изпробвате друга категория.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: '2px solid #8C1C1C',
              color: '#8C1C1C',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            Начална страница
          </Link>
          <Link
            href="/mock-search"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              background: '#8C1C1C',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            Без филтър
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function MockSearchPage() {
  return (
    <Suspense fallback={
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f4f4',
          padding: '2rem',
        }}
      >
        <div>Зареждане...</div>
      </main>
    }>
      <MockSearchContent />
    </Suspense>
  );
}


