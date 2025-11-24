'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  APARTMENT_FEATURE_FILTERS,
  CONSTRUCTION_FILTERS,
  COMPLETION_STATUSES,
} from '@/features/map-filters/filters/constants';
import { CITY_OPTIONS, getNeighborhoodsByCity, getInitialCity } from '@/lib/neighborhoods';
import { NeighborhoodSelect } from '@/components/forms/NeighborhoodSelect';
import styles from './PropertyConfiguratorPage.module.scss';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Апартамент' },
  { id: 'house', label: 'Къща' },
  { id: 'villa', label: 'Вила' },
  { id: 'office', label: 'Офис' },
  { id: 'shop', label: 'Магазин' },
  { id: 'warehouse', label: 'Склад' },
  { id: 'land', label: 'Парцел' },
  { id: 'hotel', label: 'Хотел' },
];

const PROPERTY_STATUSES = [
  { id: 'for-sale', label: 'За продажба' },
  { id: 'for-rent', label: 'Под наем' },
];

const ROOM_OPTIONS = ['1', '2', '3', '4', '5+'];

export function PropertyConfiguratorPage() {
  const [selectedType, setSelectedType] = useState(PROPERTY_TYPES[0].id);
  const [selectedStatus, setSelectedStatus] = useState(PROPERTY_STATUSES[0].id);
  const [selectedCompletion, setSelectedCompletion] = useState(COMPLETION_STATUSES[0].id);
  const [selectedConstruction, setSelectedConstruction] = useState(CONSTRUCTION_FILTERS[0].id);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState(ROOM_OPTIONS[0]);
  const initialCity = getInitialCity();
  const [city, setCity] = useState(initialCity);
  const [neighborhood, setNeighborhood] = useState(() => {
    const initialOptions = getNeighborhoodsByCity(initialCity);
    return initialOptions[0] ?? '';
  });
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [currency, setCurrency] = useState('лв');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const createdObjectUrls = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [broker, setBroker] = useState({
    name: '',
    title: '',
    phone: '',
  });
  const [yearBuilt, setYearBuilt] = useState('');

  const neighborhoodOptions = useMemo(() => getNeighborhoodsByCity(city), [city]);

  useEffect(() => {
    if (!neighborhoodOptions.length) {
      setNeighborhood('');
      return;
    }
    if (!neighborhoodOptions.includes(neighborhood)) {
      setNeighborhood(neighborhoodOptions[0]);
    }
  }, [neighborhoodOptions, neighborhood]);

  const calculatedPricePerSqm = useMemo(() => {
    if (!price || !area) {
      return '';
    }
    const priceValue = parseFloat(price);
    const areaValue = parseFloat(area);
    if (!priceValue || !areaValue) {
      return '';
    }
    return Math.round(priceValue / areaValue).toString();
  }, [price, area]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((feature) => feature !== id) : [...prev, id],
    );
  };

  const addObjectUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    createdObjectUrls.current.push(url);
    setImages((prev) => [...prev, url]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    Array.from(files).forEach((file) => addObjectUrl(file));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    const summary = [
      `Тип: ${selectedType}`,
      `Статус: ${selectedStatus}`,
      `Град: ${city}`,
      `Квартал: ${neighborhood || '—'}`,
      `Площ: ${area}`,
      `Цена: ${price}`,
      `Цена/м²: ${pricePerSqm || calculatedPricePerSqm}`,
      `Конструкция: ${selectedConstruction}`,
      `Степен: ${selectedCompletion}`,
      `Опции: ${selectedFeatures.length ? selectedFeatures.join(', ') : '—'}`,
      `Брокер: ${broker.name || 'не е добавен'}`,
    ].join('\n');
    alert(`Конфигурацията е запазена:\n${summary}`);
  };


  const removeImageField = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target && target.startsWith('blob:')) {
        URL.revokeObjectURL(target);
        createdObjectUrls.current = createdObjectUrls.current.filter((url) => url !== target);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      createdObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdObjectUrls.current = [];
    };
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <Link href="/admin/properties">Имоти</Link>
          <span>/</span>
          <span>Конфигуратор</span>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h1 className={styles.title}>Добави имот</h1>
              <p className={styles.subtitle}>Използвайте опциите по-долу за да подготвите нов имот.</p>
            </div>
            <Link href="/admin/properties/quick-view" className={styles.linkButton}>
              Назад към списъка
            </Link>
          </div>

          <section className={styles.section}>
            <h2>Основна информация</h2>
            <div className={styles.optionGrid}>
              <div className={styles.control}>
                <label>Статус</label>
                <div className={styles.radioGroup}>
                  {PROPERTY_STATUSES.map((status) => (
                    <label key={status.id} className={styles.radio}>
                      <input
                        type="radio"
                        name="status"
                        value={status.id}
                        checked={selectedStatus === status.id}
                        onChange={() => setSelectedStatus(status.id)}
                      />
                      <span>{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.control}>
                <label>Тип имот</label>
                <div className={styles.chipGroup}>
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`${styles.chip} ${
                        selectedType === type.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.control}>
                <label>Стаи</label>
                <div className={styles.chipGroup}>
                  {ROOM_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.chipSmall} ${
                        selectedRooms === option ? styles.active : ''
                      }`}
                      onClick={() => setSelectedRooms(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Основни стойности</h2>
            <div className={styles.inputsRow}>
              <Input
                label="Площ (м²)"
                placeholder="120"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
              <Input
                label="Цена"
                placeholder="250 000"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
              <Input
                label="Валута"
                placeholder="лв"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              />
              <Input
                label="Цена на м²"
                placeholder="изчислява се"
                value={pricePerSqm || calculatedPricePerSqm}
                onChange={(event) => setPricePerSqm(event.target.value)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Локация</h2>
            <div className={styles.inputsRow}>
              <div className={styles.control}>
                <label>Град</label>
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={styles.select}
                >
                  {CITY_OPTIONS.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
              <NeighborhoodSelect
                city={city}
                value={neighborhood}
                onChange={(val) => setNeighborhood(Array.isArray(val) ? val[0] ?? '' : val)}
                disabled={!city}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Изображения</h2>
            <div className={styles.imagesList}>
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div key={`image-${index}`} className={styles.imageRow}>
                    <div className={styles.imagePreview}>
                      {image ? (
                        <img src={image} alt={`Изображение ${index + 1}`} />
                      ) : (
                        <div className={styles.imagePlaceholder}>Няма визуализация</div>
                      )}
                      <span className={styles.imageUrl}>{image}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() => removeImageField(index)}
                    >
                      Премахни
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noImages}>
                  Все още няма добавени изображения. Плъзнете файлове или използвайте бутона по-долу.
                </p>
              )}
              <div
                className={styles.dropzone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <p>Пуснете изображения тук или</p>
                <button type="button" onClick={handleBrowseFiles}>
                  качи от компютър
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.fileInput}
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    if (event.target.value) {
                      event.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Описание</h2>
            <textarea
              className={styles.textarea}
              placeholder="Добавете описание на имота..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
            />
          </section>

          <section className={styles.section}>
            <h2>Параметри</h2>
            <div className={styles.filtersRow}>
              <div className={styles.control}>
                <label>Конструкция</label>
                <select
                  value={selectedConstruction}
                  onChange={(event) => setSelectedConstruction(event.target.value)}
                  className={styles.select}
                >
                  {CONSTRUCTION_FILTERS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.control}>
                <label>Степен на завършеност</label>
                <div className={styles.chipGroup}>
                  {COMPLETION_STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      className={`${styles.chipSmall} ${
                        selectedCompletion === status.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedCompletion(status.id)}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.control}>
                <label>Година на строеж</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={yearBuilt}
                  onChange={(event) => setYearBuilt(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Удобства</h2>
            <div className={styles.featuresGrid}>
              {APARTMENT_FEATURE_FILTERS.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  className={`${styles.featureCard} ${
                    selectedFeatures.includes(feature.id) ? styles.active : ''
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <span>{feature.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Брокер</h2>
            <div className={styles.brokerGrid}>
              <Input
                label="Име"
                placeholder="Иван Петров"
                value={broker.name}
                onChange={(event) => setBroker((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Input
                label="Длъжност"
                placeholder="Старши брокер"
                value={broker.title}
                onChange={(event) => setBroker((prev) => ({ ...prev, title: event.target.value }))}
              />
              <Input
                label="Телефон"
                placeholder="+359 888 123 456"
                value={broker.phone}
                onChange={(event) => setBroker((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
          </section>

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleSubmit}>
              Запази конфигурацията
            </Button>
            <Link href="/admin/properties/quick-view" className={styles.linkButton}>
              Отказ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

