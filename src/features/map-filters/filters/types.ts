import { ReactNode } from 'react';

export type FeatureFilter = {
    id: string;
    label: string;
    icon: ReactNode | null;
};

export type ConstructionFilter = {
    id: string;
    label: string;
    icon: ReactNode;
};

export type ApartmentSubtype = {
    id: string;
    label: string;
    icon?: ReactNode;
};

export type FloorSpecialOption = {
    id: string;
    label: string;
};

export type CompletionStatus = {
    id: string;
    label: string;
    icon: ReactNode;
};

// Constants
export const AREA_SLIDER_MAX = 256;
export const SQUARE_AREA_CAP = 256;
export const HOUSE_AREA_SLIDER_MAX = 350;
export const HOUSE_AREA_CAP = 350;
export const YARD_AREA_SLIDER_MAX = 1000;
export const YARD_AREA_CAP = 1000;
export const PRICE_SLIDER_MAX = 300000;
export const HOUSE_PRICE_SLIDER_MAX = 420000;
export const PRICE_PER_SQM_SLIDER_MAX = 3000;
export const YEAR_SLIDER_MIN = 1900;
export const YEAR_SLIDER_MAX = 2050;
export const FLOOR_SLIDER_MIN = 0;
export const FLOOR_SLIDER_MAX = 20;
export const COMMERCIAL_AREA_SLIDER_MAX = 420;
export const COMMERCIAL_PRICE_SLIDER_MAX = 560000;
export const COMMERCIAL_PRICE_PER_SQM_SLIDER_MAX = 3200;
export const BUILDING_PLOTS_AREA_SLIDER_MAX = 80000;
export const BUILDING_PLOTS_PRICE_SLIDER_MAX = 480000;
export const BUILDING_PLOTS_PRICE_PER_SQM_SLIDER_MAX = 160;
export const AGRICULTURAL_AREA_SLIDER_MAX = 30000;
export const AGRICULTURAL_PRICE_SLIDER_MAX = 540000;
export const AGRICULTURAL_PRICE_PER_SQM_SLIDER_MAX = 100;
export const WAREHOUSES_AREA_SLIDER_MAX = 9000;
export const WAREHOUSES_PRICE_SLIDER_MAX = 1800000;
export const WAREHOUSES_PRICE_PER_SQM_SLIDER_MAX = 1200;
export const GARAGES_AREA_SLIDER_MAX = 200;
export const GARAGES_PRICE_SLIDER_MAX = 56000;
export const GARAGES_PRICE_PER_SQM_SLIDER_MAX = 2000;
export const HOTELS_AREA_SLIDER_MAX = 4900;
export const HOTELS_BED_BASE_SLIDER_MAX = 120;
export const HOTELS_PRICE_SLIDER_MAX = 3200000;
export const HOTELS_PRICE_PER_SQM_SLIDER_MAX = 2100;
export const ESTABLISHMENTS_AREA_SLIDER_MAX = 560;
export const ESTABLISHMENTS_PRICE_SLIDER_MAX = 700000;
export const ESTABLISHMENTS_PRICE_PER_SQM_SLIDER_MIN = 50;
export const ESTABLISHMENTS_PRICE_PER_SQM_SLIDER_MAX = 2800;
export const BUY_REAL_ESTATES_PRICE_SLIDER_MAX = 560000;
export const OTHER_REAL_ESTATES_PRICE_SLIDER_MAX = 3500000;

export type HouseType = {
    id: string;
    label: string;
    icon?: ReactNode;
};

