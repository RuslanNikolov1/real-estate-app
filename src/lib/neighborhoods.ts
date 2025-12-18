import citiesNeighborhoods from '@/data/citiesNeighborhoods.json';

type NeighborhoodRecord = {
  name: string;
};

type CityRecord = {
  cityName: string;
  neighborhoods: NeighborhoodRecord[];
};

const CITY_ENTRIES: CityRecord[] = Object.values(
  citiesNeighborhoods as Record<string, CityRecord>,
);

// Define the specific order of cities for the dropdown
export const CITY_OPTIONS: string[] = [
  'Бургас',
  'Поморие',
  'Ахелой',
  'Равда',
  'Несебър',
  'Слънчев бряг',
  'Свети Влас',
  'Елените',
  'Кошарица',
  'Черноморец',
  'Царево',
  'Китен',
  'Созопол',
  'Приморско',
  'Синеморец'
];

export const getNeighborhoodsByCity = (cityName?: string): string[] => {
  if (!cityName) {
    return [];
  }
  const entry = CITY_ENTRIES.find((item) => item.cityName === cityName);
  if (!entry) {
    return [];
  }
  return entry.neighborhoods.map((nb) => nb.name);
};

export const getInitialCity = () => CITY_OPTIONS[0] ?? '';





































