import type { ComponentType } from 'react';
import {
  Buildings,
  House,
  Storefront,
  MapPin,
  TreeEvergreen,
  Warehouse,
  Car,
  Bed,
  ForkKnife,
  ArrowsClockwise,
  ShoppingCart,
  GridNine,
} from '@phosphor-icons/react';

export interface PropertyTypeOption {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; weight?: 'fill' | 'regular' | 'bold' | 'thin' | 'light' | 'duotone' }>;
}

export const propertyTypes: PropertyTypeOption[] = [
  { id: 'apartments', label: 'Апартаменти', icon: Buildings },
  { id: 'houses-villas', label: 'Къщи/Вили', icon: House },
  { id: 'stores-offices', label: 'Магазини/Офиси/Кабинети/Салони', icon: Storefront },
  { id: 'building-plots', label: 'Строителни парцели/Инвестиционни проекти', icon: MapPin },
  { id: 'agricultural-land', label: 'Земеделска земя/Лозя/Гори', icon: TreeEvergreen },
  { id: 'warehouses-industrial', label: 'Складове/Индустриални и стопански имоти', icon: Warehouse },
  { id: 'garages-parking', label: 'Гаражи/Паркоместа', icon: Car },
  { id: 'hotels-motels', label: 'Хотели/Мотели', icon: Bed },
  { id: 'restaurants', label: 'Ресторанти', icon: ForkKnife },
  { id: 'replace-real-estates', label: 'Замяна на недвижими имоти', icon: ArrowsClockwise },
  { id: 'buy-real-estates', label: 'Купуване на недвижими имоти', icon: ShoppingCart },
  { id: 'other-real-estates', label: 'Други недвижими имоти', icon: GridNine },
];

