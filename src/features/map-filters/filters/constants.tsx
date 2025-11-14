import { ReactNode } from 'react';
import {
    Armchair,
    ArrowFatLinesUp,
    ArrowsLeftRight,
    Bed,
    Buildings,
    Car,
    CheckCircle,
    Cube,
    CurrencyCircleDollar,
    Factory,
    Fire,
    FireSimple,
    Hammer,
    Handshake,
    House,
    HouseLine,
    Infinity,
    Palette,
    PaintRoller,
    Question,
    ShieldCheck,
    SolarPanel,
    Storefront,
    SunHorizon,
    Thermometer,
    TreeEvergreen,
} from '@phosphor-icons/react';
import type { FeatureFilter, ConstructionFilter, ApartmentSubtype, FloorSpecialOption, CompletionStatus, HouseType } from './types';

const bedIconSize = 20;

export const createBedIcons = (count: number): ReactNode[] =>
    Array.from({ length: count }, (_, index) => (
        <Bed key={index} size={bedIconSize} weight="regular" />
    ));

export const APARTMENT_SUBTYPES: ApartmentSubtype[] = [
    {
        id: 'all',
        label: 'Всички'
    },
    { id: 'studio', label: 'Едностаен', icon: <Bed size={bedIconSize} weight="regular" /> },
    { id: 'one-bedroom', label: 'Двустаен', icon: createBedIcons(2) },
    { id: 'two-bedroom', label: 'Тристаен', icon: createBedIcons(3) },
    {
        id: 'multi-bedroom',
        label: 'Многостаен',
        icon: (
            <>
                <Bed size={bedIconSize} weight="regular" />
                <Infinity size={bedIconSize} weight="regular" />
            </>
        )
    },
    { id: 'maisonette', label: 'Мезонет', icon: <HouseLine size={bedIconSize} weight="regular" /> },
    { id: 'atelier', label: 'Ателие/Студио', icon: <Palette size={bedIconSize} weight="regular" /> },
    { id: 'attic', label: 'Таван', icon: <SolarPanel size={bedIconSize} weight="regular" /> },
];

export const APARTMENT_FEATURE_FILTERS: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'gasified', label: 'Газифициран', icon: <Fire size={18} weight="bold" /> },
    { id: 'parking', label: 'Гараж/Паркомясто', icon: <Car size={18} weight="bold" /> },
    { id: 'turnkey', label: 'До ключ', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'barter', label: 'Замяна/Бартер', icon: <ArrowsLeftRight size={18} weight="bold" /> },
    { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
    { id: 'fireplace', label: 'Камина', icon: <FireSimple size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'unfurnished', label: 'Необзаведен', icon: <Cube size={18} weight="bold" /> },
    { id: 'furnished', label: 'Обзаведен', icon: <Armchair size={18} weight="bold" /> },
    { id: 'sea-view', label: 'Панорама море', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'mountain-view', label: 'Панорама планина', icon: <TreeEvergreen size={18} weight="bold" /> },
    { id: 'security', label: 'Портиер/Охрана', icon: <ShieldCheck size={18} weight="bold" /> },
    { id: 'renovated-insulated', label: 'Саниран', icon: <Hammer size={18} weight="bold" /> },
    { id: 'recently-renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'district-heating', label: 'ТЕЦ', icon: <Factory size={18} weight="bold" /> },
];

export const CONSTRUCTION_FILTERS: ConstructionFilter[] = [
    { id: 'brick', label: 'Тухла', icon: <Cube size={18} weight="bold" /> },
    { id: 'epk', label: 'ЕПК/ПК', icon: <Factory size={18} weight="bold" /> },
    { id: 'panel', label: 'Панел', icon: <Cube size={18} weight="fill" /> },
    { id: 'wood', label: 'Гредоред', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

export const FLOOR_SPECIAL_OPTIONS: FloorSpecialOption[] = [
    { id: 'basement', label: 'Сутерен' },
    { id: 'ground', label: 'Партер' },
    { id: 'first-residential', label: 'Първи жилищен' },
    { id: 'not-last', label: 'Непоследен' },
    { id: 'last', label: 'Последен' },
    { id: 'attic', label: 'Мансарда/Таванско помещение' },
    { id: 'unspecified', label: 'Не е посочено' },
];

export const COMPLETION_STATUSES: CompletionStatus[] = [
    { id: 'completed', label: 'Завършен', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'under-construction', label: 'В строеж', icon: <Hammer size={18} weight="bold" /> },
    { id: 'project', label: 'В проект', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

export const HOUSE_TYPES: HouseType[] = [
    { id: 'all', label: 'Всички' },
    { id: 'one-floor', label: 'Едноетажна къща', icon: <HouseLine size={20} weight="regular" /> },
    { id: 'two-floor', label: 'Двуетажна къща', icon: (
        <>
            <HouseLine size={20} weight="regular" />
            <HouseLine size={20} weight="regular" />
        </>
    ) },
    { id: 'three-floor', label: 'Триетажна къща', icon: (
        <>
            <HouseLine size={20} weight="regular" />
            <HouseLine size={20} weight="regular" />
            <HouseLine size={20} weight="regular" />
        </>
    ) },
    { id: 'house-floor', label: 'Етаж от къща', icon: <Cube size={20} weight="regular" /> },
    { id: 'four-plus-floor', label: 'Четириетажна+', icon: (
        <>
            <HouseLine size={20} weight="regular" />
            <Infinity size={20} weight="regular" />
        </>
    ) },
    { id: 'not-specified', label: 'Не е посочено', icon: <Question size={20} weight="regular" /> },
];

export const HOUSE_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'independent', label: 'Самостоятелна', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'pool', label: 'Басейн', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'barbecue-gazebo', label: 'Барбекю/Беседка', icon: <Fire size={18} weight="bold" /> },
    { id: 'renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'extra-settings', label: 'Допълнителни настройки', icon: <Cube size={18} weight="bold" /> },
    { id: 'sewerage', label: 'Канализация', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'electricity', label: 'Ток', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'water', label: 'Вода', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'well', label: 'Кладенец', icon: <TreeEvergreen size={18} weight="bold" /> },
    { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'gasified', label: 'Газифицирана', icon: <Fire size={18} weight="bold" /> },
    { id: 'solar-panels', label: 'Слънчеви колектори', icon: <SolarPanel size={18} weight="bold" /> },
    { id: 'garage', label: 'Гараж', icon: <Car size={18} weight="bold" /> },
    { id: 'fireplace', label: 'Камина', icon: <FireSimple size={18} weight="bold" /> },
    { id: 'wooden-frame', label: 'Гредоред', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'prefab', label: 'Сглобяема къща', icon: <Factory size={18} weight="bold" /> },
    { id: 'gated-community', label: 'В затворен комплекс', icon: <ShieldCheck size={18} weight="bold" /> },
    { id: 'sea-view', label: 'Панорама море', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'mountain-view', label: 'Панорама планина', icon: <TreeEvergreen size={18} weight="bold" /> },
];

export const HOUSE_PRICE_PRESETS = [
    { id: '1-60000', label: '1 - 60 000', from: 1, to: 60000 },
    { id: '60000-120000', label: '60 000 - 120 000', from: 60000, to: 120000 },
    { id: '120000-180000', label: '120 000 - 180 000', from: 120000, to: 180000 },
    { id: '180000-240000', label: '180 000 - 240 000', from: 180000, to: 240000 },
    { id: '240000-300000', label: '240 000 - 300 000', from: 240000, to: 300000 },
    { id: '300000-360000', label: '300 000 - 360 000', from: 300000, to: 360000 },
    { id: '360000-420000', label: '360 000 - 420 000', from: 360000, to: 420000 },
    { id: '420000-plus', label: '420 000 - 7 500 000', from: 420000, to: 7500000 },
];

// Commercial Property Types (Магазини, Офиси, Кабинети, Салони)
export const COMMERCIAL_PROPERTY_TYPES: ApartmentSubtype[] = [
    { id: 'all', label: 'Всички' },
    { id: 'store', label: 'Магазин', icon: <Storefront size={20} weight="regular" /> },
    { id: 'office', label: 'Офис', icon: <Buildings size={20} weight="regular" /> },
    { id: 'cabinet', label: 'Кабинет', icon: <Cube size={20} weight="regular" /> },
    { id: 'beauty-salon', label: 'Салон за красота', icon: <Palette size={20} weight="regular" /> },
    { id: 'sport', label: 'Спорт', icon: <Fire size={20} weight="regular" /> },
    { id: 'other', label: 'Друго', icon: <Question size={20} weight="regular" /> },
];

// Commercial Property Features
export const COMMERCIAL_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'parking', label: 'Паркинг', icon: <Car size={18} weight="bold" /> },
    { id: 'garage', label: 'С гараж', icon: <Car size={18} weight="bold" /> },
    { id: 'working', label: 'Работещ', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'recently-renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'loading-entrance', label: 'Товарен вход', icon: <Factory size={18} weight="bold" /> },
    { id: 'three-phase-power', label: 'Трифазен ток', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'corner', label: 'Ъглов', icon: <Cube size={18} weight="bold" /> },
    { id: 'security', label: 'Охрана', icon: <ShieldCheck size={18} weight="bold" /> },
    { id: 'furnished', label: 'Обзаведен', icon: <Armchair size={18} weight="bold" /> },
    { id: 'warehouse', label: 'Склад', icon: <Factory size={18} weight="bold" /> },
    { id: 'toilet', label: 'Тоалетна', icon: <CheckCircle size={18} weight="bold" /> },
];

// Building Types (Вид сграда)
export type BuildingType = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const BUILDING_TYPES: BuildingType[] = [
    { id: 'business-building', label: 'В бизнес сграда', icon: <Buildings size={18} weight="bold" /> },
    { id: 'residential-building', label: 'В жилищна сграда', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'standalone-building', label: 'В самостоятелна сграда', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Commercial Floor Options
export const COMMERCIAL_FLOOR_OPTIONS: FloorSpecialOption[] = [
    { id: 'ground', label: 'Партер' },
    { id: 'basement', label: 'Сутерен' },
    { id: 'first-floor', label: 'Първи етаж' },
    { id: 'intermediate-floor', label: 'Междинен етаж' },
    { id: 'last-floor', label: 'Последен етаж' },
    { id: 'unspecified', label: 'Не е посочено' },
];

// Building Plots - Electricity Options (Ток)
export type ElectricityOption = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const ELECTRICITY_OPTIONS: ElectricityOption[] = [
    { id: 'all', label: 'Всички', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'with-electricity', label: 'С ток', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'without-electricity', label: 'Без ток', icon: <Cube size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Building Plots - Water Options (Вода)
export type WaterOption = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const WATER_OPTIONS: WaterOption[] = [
    { id: 'all', label: 'Всички', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'with-water', label: 'Водопровод', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'without-water', label: 'Без вода', icon: <Cube size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Building Plots Features
export const BUILDING_PLOTS_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'asphalt-road', label: 'Асфалтов път', icon: <Car size={18} weight="bold" /> },
    { id: 'visa', label: 'Виза', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'dividable', label: 'Делим', icon: <ArrowsLeftRight size={18} weight="bold" /> },
    { id: 'main-road', label: 'До главен път', icon: <Car size={18} weight="bold" /> },
    { id: 'regulation', label: 'До регулация', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'river', label: 'До река', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'residential-construction', label: 'За жилищно строителство', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'industrial-construction', label: 'За промишлено строителство', icon: <Factory size={18} weight="bold" /> },
    { id: 'sewerage', label: 'Канализация', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'well', label: 'Кладенец', icon: <TreeEvergreen size={18} weight="bold" /> },
    { id: 'panoramic-view', label: 'Панорамна гледка', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'sea-front', label: 'Първа линия море', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'flat', label: 'Равен', icon: <Cube size={18} weight="bold" /> },
];

// Agricultural Property Types (Земеделска земя, градини, лозя, гора)
export const AGRICULTURAL_PROPERTY_TYPES: ApartmentSubtype[] = [
    { id: 'forest', label: 'Гора', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'agricultural-land', label: 'Земеделска земя', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'vineyard', label: 'Лозе', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'fruit-garden', label: 'Овощна градина', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'pasture', label: 'Пасище', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={20} weight="regular" /> },
];

// Agricultural Area Presets
export type AreaPreset = {
    id: string;
    label: string;
    from: number;
    to: number;
};

export const AGRICULTURAL_AREA_PRESETS: AreaPreset[] = [
    { id: '0-5000', label: '0 - 5 000', from: 0, to: 5000 },
    { id: '5000-10000', label: '5 000 - 10 000', from: 5000, to: 10000 },
    { id: '10000-15000', label: '10 000 - 15 000', from: 10000, to: 15000 },
    { id: '15000-20000', label: '15 000 - 20 000', from: 15000, to: 20000 },
    { id: '25000-30000', label: '25 000 - 30 000', from: 25000, to: 30000 },
    { id: '30000-plus', label: '30 000 - 48 000 000', from: 30000, to: 48000000 },
];

// Agricultural Categories (Категория)
export type CategoryOption = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const AGRICULTURAL_CATEGORIES: CategoryOption[] = [
    { id: 'all', label: 'Всички', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
    { id: 'first', label: 'Първа категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'second', label: 'Втора категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'third', label: 'Трета категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'fourth', label: 'Четвърта категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'fifth', label: 'Пета категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'sixth', label: 'Шеста категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'seventh', label: 'Седма категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'eighth', label: 'Осма категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'ninth', label: 'Девета категория', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'tenth', label: 'Десета категория', icon: <CheckCircle size={18} weight="bold" /> },
];

// Agricultural Features (Особености)
export const AGRICULTURAL_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'water', label: 'Вода', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'dividable', label: 'Делима', icon: <ArrowsLeftRight size={18} weight="bold" /> },
    { id: 'to-road', label: 'До път', icon: <Car size={18} weight="bold" /> },
    { id: 'to-river', label: 'До река', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'wind-turbines', label: 'Подходяща за ветрогенератори', icon: <Factory size={18} weight="bold" /> },
    { id: 'irrigated', label: 'Поливна', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'with-building', label: 'С постройка', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'electricity', label: 'Ток', icon: <CheckCircle size={18} weight="bold" /> },
];

// Warehouse/Industrial Property Types (Складове, промишлени и стопански имоти)
export const WAREHOUSES_PROPERTY_TYPES: ApartmentSubtype[] = [
    { id: 'all', label: 'Всички' },
    { id: 'warehouse', label: 'Склад', icon: <Factory size={20} weight="regular" /> },
    { id: 'industrial-premise', label: 'Промишлено помещение', icon: <Factory size={20} weight="regular" /> },
    { id: 'farm', label: 'Ферма', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'factory', label: 'Фабрика', icon: <Factory size={20} weight="regular" /> },
    { id: 'service', label: 'Сервиз', icon: <Car size={20} weight="regular" /> },
    { id: 'car-wash', label: 'Автомивка', icon: <Car size={20} weight="regular" /> },
    { id: 'gas-station', label: 'Бензиностанция', icon: <Car size={20} weight="regular" /> },
    { id: 'hall', label: 'Зала', icon: <Cube size={20} weight="regular" /> },
    { id: 'other', label: 'Друго', icon: <Question size={20} weight="regular" /> },
];

// Warehouse/Industrial Features (Особености)
export const WAREHOUSES_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'wc', label: 'WC', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'warehouse-base', label: 'В складова база', icon: <Factory size={18} weight="bold" /> },
    { id: 'yard', label: 'Двор', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'equipment', label: 'Оборудване', icon: <Factory size={18} weight="bold" /> },
    { id: 'three-phase-power', label: 'Трифазен ток', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'water', label: 'Вода', icon: <SunHorizon size={18} weight="bold" /> },
];

// Garage/Parking Property Types (Гаражи, Паркоместа)
export const GARAGES_PROPERTY_TYPES: ApartmentSubtype[] = [
    { id: 'all', label: 'Всички' },
    { id: 'garage-standalone', label: 'Гараж (самостоятелен)', icon: <Car size={20} weight="regular" /> },
    { id: 'parking-space', label: 'Паркомясто', icon: <Car size={20} weight="regular" /> },
    { id: 'whole-parking', label: 'Цял паркинг', icon: <Car size={20} weight="regular" /> },
];

// Garage Construction Types (Вид конструкция)
export type GarageConstructionType = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const GARAGE_CONSTRUCTION_TYPES: GarageConstructionType[] = [
    { id: 'open', label: 'На открито/Няма', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'brick', label: 'Тухла', icon: <Cube size={18} weight="bold" /> },
    { id: 'concrete-panel', label: 'Бетон/Панел', icon: <Cube size={18} weight="fill" /> },
    { id: 'metal', label: 'Метален', icon: <Factory size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Garage/Parking Features (Особености)
export const GARAGES_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'automatic-door', label: 'Автоматична врата', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'barter', label: 'Бартер', icon: <ArrowsLeftRight size={18} weight="bold" /> },
    { id: 'water', label: 'Вода', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'rear', label: 'Заден', icon: <Car size={18} weight="bold" /> },
    { id: 'repair-channel', label: 'Канал за ремонт', icon: <Factory size={18} weight="bold" /> },
    { id: 'sewerage', label: 'Канализация', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'lighted', label: 'Осветен', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'separate-meter', label: 'Отделен електромер', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'heated', label: 'Отопляем', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'security', label: 'Охрана', icon: <ShieldCheck size={18} weight="bold" /> },
    { id: 'front', label: 'Преден', icon: <Car size={18} weight="bold" /> },
    { id: 'electricity', label: 'Ток', icon: <CheckCircle size={18} weight="bold" /> },
];

// Hotel/Motel Property Types (Хотели, Мотели)
export const HOTELS_PROPERTY_TYPES: ApartmentSubtype[] = [
    { id: 'all', label: 'Всички' },
    { id: 'hotel', label: 'Хотел', icon: <Bed size={20} weight="regular" /> },
    { id: 'family-hotel', label: 'Семеен хотел', icon: <Bed size={20} weight="regular" /> },
    { id: 'resort', label: 'Почивна станция', icon: <SunHorizon size={20} weight="regular" /> },
    { id: 'hostel-pension', label: 'Хостел/Пансион', icon: <Bed size={20} weight="regular" /> },
    { id: 'motel', label: 'Мотели', icon: <Bed size={20} weight="regular" /> },
    { id: 'lodge', label: 'Хижа', icon: <TreeEvergreen size={20} weight="regular" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={20} weight="regular" /> },
];

// Hotel Categories (Категория - звезди)
export type HotelCategory = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const HOTEL_CATEGORIES: HotelCategory[] = [
    { id: 'all', label: 'Всички', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'uncategorized', label: 'Не е категоризиран', icon: <Question size={18} weight="bold" /> },
    { id: 'one-star', label: '1 звезда', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'two-stars', label: '2 звезди', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'three-stars', label: '3 звезди', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'four-stars', label: '4 звезди', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'five-stars', label: '5 звезди', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Hotel Construction Types (Тип строителство)
export type HotelConstructionType = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const HOTEL_CONSTRUCTION_TYPES: HotelConstructionType[] = [
    { id: 'all', label: 'Всички', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'brick', label: 'Тухла', icon: <Cube size={18} weight="bold" /> },
    { id: 'epk', label: 'ЕПК/ПК', icon: <Factory size={18} weight="bold" /> },
    { id: 'other', label: 'Друго', icon: <Cube size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Bed Base Presets (Леглова база)
export type BedBasePreset = {
    id: string;
    label: string;
    from: number;
    to: number;
};

export const HOTEL_BED_BASE_PRESETS: BedBasePreset[] = [
    { id: '1-20', label: '1 - 20', from: 1, to: 20 },
    { id: '20-40', label: '20 - 40', from: 20, to: 40 },
    { id: '40-60', label: '40 - 60', from: 40, to: 60 },
    { id: '60-80', label: '60 - 80', from: 60, to: 80 },
    { id: '80-100', label: '80 - 100', from: 80, to: 100 },
    { id: '100-120', label: '100 - 120', from: 100, to: 120 },
    { id: '120-plus', label: '120 - 2500', from: 120, to: 2500 },
];

// Hotel/Motel Features (Особености)
export const HOTELS_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'district-heating', label: 'ТЕЦ', icon: <Factory size={18} weight="bold" /> },
    { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'parking', label: 'Паркинг', icon: <Car size={18} weight="bold" /> },
    { id: 'garage', label: 'Гараж', icon: <Car size={18} weight="bold" /> },
    { id: 'furnished', label: 'Обзаведен', icon: <Armchair size={18} weight="bold" /> },
    { id: 'pool', label: 'Басейн', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'fitness', label: 'Фитнес', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'spa', label: 'СПА', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'conference-hall', label: 'Конферентна зала', icon: <Cube size={18} weight="bold" /> },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'restaurant', label: 'Ресторант', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'panoramic-view', label: 'Панорамна гледка', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'sea-front', label: 'Първа линия море', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'park-garden', label: 'Парк/Градина', icon: <TreeEvergreen size={18} weight="bold" /> },
    { id: 'working', label: 'Работещ', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'recently-renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
    { id: 'barter', label: 'Бартер', icon: <ArrowsLeftRight size={18} weight="bold" /> },
];

// Establishment Location Types (Разположение)
export const ESTABLISHMENTS_LOCATION_TYPES: ApartmentSubtype[] = [
    { id: 'all', label: 'Всички' },
    { id: 'residential-building', label: 'В жилищна сграда', icon: <HouseLine size={20} weight="regular" /> },
    { id: 'business-building', label: 'В бизнес сграда', icon: <Buildings size={20} weight="regular" /> },
    { id: 'standalone-building', label: 'Самостоятелна сграда', icon: <House size={20} weight="regular" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={20} weight="regular" /> },
];

// Establishment Construction Types (Тип строителство)
export type EstablishmentConstructionType = {
    id: string;
    label: string;
    icon: ReactNode;
};

export const ESTABLISHMENT_CONSTRUCTION_TYPES: EstablishmentConstructionType[] = [
    { id: 'brick', label: 'Тухла', icon: <Cube size={18} weight="bold" /> },
    { id: 'epk', label: 'ЕПК/ПК', icon: <Factory size={18} weight="bold" /> },
    { id: 'panel', label: 'Панел', icon: <Cube size={18} weight="fill" /> },
    { id: 'frame', label: 'Гредоред', icon: <HouseLine size={18} weight="bold" /> },
    { id: 'metal', label: 'Метална конструкция', icon: <Factory size={18} weight="bold" /> },
    { id: 'massive', label: 'Масивна конструкция', icon: <Cube size={18} weight="bold" /> },
    { id: 'unspecified', label: 'Не е посочено', icon: <Question size={18} weight="bold" /> },
];

// Establishment Features (Особености)
export const ESTABLISHMENTS_FEATURES: FeatureFilter[] = [
    { id: 'all', label: 'Всички', icon: null },
    { id: 'garden', label: 'Градина', icon: <TreeEvergreen size={18} weight="bold" /> },
    { id: 'terrace', label: 'Тераса', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'panoramic-view', label: 'Панорамна гледка', icon: <SunHorizon size={18} weight="bold" /> },
    { id: 'local-heating', label: 'Локално отопление', icon: <Thermometer size={18} weight="bold" /> },
    { id: 'district-heating', label: 'ТЕЦ', icon: <Factory size={18} weight="bold" /> },
    { id: 'parking', label: 'Паркинг', icon: <Car size={18} weight="bold" /> },
    { id: 'elevator', label: 'Асансьор', icon: <ArrowFatLinesUp size={18} weight="bold" /> },
    { id: 'three-phase-power', label: 'Трифазен ток', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'cargo-entrance', label: 'Товарен вход', icon: <Factory size={18} weight="bold" /> },
    { id: 'equipment', label: 'Оборудване', icon: <Factory size={18} weight="bold" /> },
    { id: 'warehouse', label: 'Склад', icon: <Factory size={18} weight="bold" /> },
    { id: 'kitchen', label: 'Кухня', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'recently-renovated', label: 'След ремонт', icon: <PaintRoller size={18} weight="bold" /> },
    { id: 'ready-documents', label: 'С готови документи', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'working', label: 'Работещо', icon: <CheckCircle size={18} weight="bold" /> },
    { id: 'leasing', label: 'Лизинг', icon: <Handshake size={18} weight="bold" /> },
    { id: 'barter', label: 'Бартер', icon: <ArrowsLeftRight size={18} weight="bold" /> },
    { id: 'mortgaged', label: 'Ипотекиран', icon: <CurrencyCircleDollar size={18} weight="bold" /> },
];

