'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { Certificate } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';
import styles from './CertificateModal.module.scss';

interface CertificateModalProps {
  certificate: Certificate | null;
  onSave: (certificate: Certificate) => void;
  onClose: () => void;
}

export function CertificateModal({
  certificate,
  onSave,
  onClose,
}: CertificateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    public_id: '',
    order: 1,
  });

  useEffect(() => {
    if (certificate) {
      setFormData({
        title: certificate.title,
        description: certificate.description || '',
        image_url: certificate.image_url,
        public_id: certificate.public_id,
        order: certificate.order,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        public_id: '',
        order: 1,
      });
    }
  }, [certificate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cert: Certificate = {
      id: certificate?.id || '',
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      public_id: formData.public_id,
      order: formData.order,
      created_at: certificate?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onSave(cert);
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>
              {certificate ? 'Редактирай сертификат' : 'Добави сертификат'}
            </h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Заглавие"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <div className={styles.textareaWrapper}>
              <label htmlFor="description" className={styles.label}>
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={styles.textarea}
                rows={4}
              />
            </div>

            <Input
              label="URL на изображение"
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              required
            />

            <Input
              label="Public ID (Cloudinary)"
              value={formData.public_id}
              onChange={(e) =>
                setFormData({ ...formData, public_id: e.target.value })
              }
            />

            <Input
              label="Ред (Order)"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
              required
            />

            {formData.image_url && (
              <div className={styles.imagePreview}>
                <CloudinaryImage
                  src={formData.image_url}
                  publicId={formData.public_id}
                  alt="Preview"
                  width={600}
                  height={300}
                  className={styles.previewImage}
                />
              </div>
            )}

            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={onClose}>
                Отказ
              </Button>
              <Button variant="primary" type="submit">
                {certificate ? 'Запази промените' : 'Добави сертификат'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

