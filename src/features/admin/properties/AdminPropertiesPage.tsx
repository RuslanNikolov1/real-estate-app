'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminPropertyCard } from './components/AdminPropertyCard';
import { PropertyUpdateModal } from './components/PropertyUpdateModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Property } from '@/types';
import { PlusCircle, Search } from 'lucide-react';
import { mockProperties } from '@/features/properties/PropertiesListPage';
import styles from './AdminPropertiesPage.module.scss';

export function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'for-sale' | 'for-rent'>('all');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.neighborhood &&
        property.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'all' || property.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: API call to delete property
      // await deleteProperty(propertyToDelete.id);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProperties((prev) =>
        prev.filter((property) => property.id !== propertyToDelete.id)
      );
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Грешка при изтриването на имота. Моля, опитайте отново.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleUpdate = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === id
          ? { ...property, ...updates, updated_at: new Date().toISOString() }
          : property
      )
    );
  };

  const openUpdateModal = (property: Property) => {
    setSelectedProperty(property);
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedProperty(null);
  };

  const totalProperties = properties.length;
  const forSaleCount = properties.filter((p) => p.status === 'for-sale').length;
  const forRentCount = properties.filter((p) => p.status === 'for-rent').length;

  return (
    <div className={styles.adminPropertiesPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Управление на имоти</h1>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/properties/new')}
            >
              <PlusCircle size={20} /> Добави имот
            </Button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Общо имоти</h3>
              <p>{totalProperties}</p>
            </div>
            <div className={styles.statCard}>
              <h3>За продажба</h3>
              <p>{forSaleCount}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Под наем</h3>
              <p>{forRentCount}</p>
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Търсене по заглавие, описание, град или квартал..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterButtons}>
              <button
                onClick={() => setFilterStatus('all')}
                className={`${styles.filterButton} ${
                  filterStatus === 'all' ? styles.active : ''
                }`}
              >
                Всички
              </button>
              <button
                onClick={() => setFilterStatus('for-sale')}
                className={`${styles.filterButton} ${
                  filterStatus === 'for-sale' ? styles.active : ''
                }`}
              >
                За продажба
              </button>
              <button
                onClick={() => setFilterStatus('for-rent')}
                className={`${styles.filterButton} ${
                  filterStatus === 'for-rent' ? styles.active : ''
                }`}
              >
                Под наем
              </button>
            </div>
          </div>

          <div className={styles.propertiesGrid}>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <AdminPropertyCard
                  key={property.id}
                  property={property}
                  onEdit={() => router.push(`/admin/properties/${property.id}/edit`)}
                  onUpdate={() => openUpdateModal(property)}
                  onDelete={() => handleDeleteClick(property)}
                />
              ))
            ) : (
              <p className={styles.noResults}>Няма намерени имоти.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <PropertyUpdateModal
        isOpen={updateModalOpen}
        onClose={closeUpdateModal}
        property={selectedProperty}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        property={propertyToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}

