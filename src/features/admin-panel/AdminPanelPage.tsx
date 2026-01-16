'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import type { IconProps } from '@phosphor-icons/react';
import { House, ChatCircleText, GearSix, Clock } from '@phosphor-icons/react';
import { Header } from '@/components/layout/Header';
import styles from './AdminPanelPage.module.scss';

type AdminAction = {
  label: string;
  description: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const adminActions: AdminAction[] = [
  {
    label: 'Имоти',
    description: 'Създавайте, обновявайте и премахвайте обяви във всички категории имоти.',
    href: '/admin/properties/quick-view',
    icon: House,
  },
  {
    label: 'Отзиви',
    description: 'Преглеждайте, публикувайте или скривайте клиентски отзиви и препоръки.',
    href: '/admin/reviews',
    icon: ChatCircleText,
  },
  {
    label: 'Имоти за одобрение',
    description: 'Преглеждайте и одобрявайте или отхвърляйте обяви за имоти, публикувани от клиенти.',
    href: '/admin/pending-properties',
    icon: Clock,
  },
];

export function AdminPanelPage() {
  return (
    <>
      <Header />
      <section className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            <GearSix size={28} weight="bold" />
            <span>Админ панел</span>
            <GearSix size={28} weight="bold" />
          </h1>

          <div className={styles.actionsRow}>
            {adminActions.map((action) => (
              <Link key={action.href} href={action.href} className={styles.actionCard}>
                <h2 className={styles.actionTitle}>
                  <action.icon size={24} weight="bold" />
                  <span>{action.label}</span>
                </h2>
                <p>{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

