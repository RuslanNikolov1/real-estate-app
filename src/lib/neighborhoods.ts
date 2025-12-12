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

export const CITY_OPTIONS: string[] = CITY_ENTRIES.map((entry) => entry.cityName).sort((a, b) =>
  a.localeCompare(b, 'bg'),
);

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
































