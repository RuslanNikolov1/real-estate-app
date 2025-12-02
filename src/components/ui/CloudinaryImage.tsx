'use client';

import Image, { type ImageProps } from 'next/image';
import { CldImage, type CldImageProps } from 'next-cloudinary';

type CloudinaryImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  publicId?: string | null;
  cldOptions?: Partial<CldImageProps>;
};

const CLOUDINARY_DOMAIN = 'res.cloudinary.com';

const isCloudinaryUrl = (value?: string): boolean => {
  return typeof value === 'string' && value.includes(CLOUDINARY_DOMAIN);
};

const extractPublicIdFromUrl = (url?: string): string | undefined => {
  if (!url || !isCloudinaryUrl(url)) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const deliveryIdx = segments.findIndex((segment) => segment === 'upload' || segment === 'private' || segment === 'authenticated');

    if (deliveryIdx === -1 || deliveryIdx === segments.length - 1) {
      return undefined;
    }

    return segments.slice(deliveryIdx + 1).join('/');
  } catch {
    return undefined;
  }
};

/**
 * Wrapper that prefers Cloudinary's optimized delivery when we have a valid public_id,
 * but falls back to the regular Next.js Image component for everything else (e.g. mock data).
 */
export function CloudinaryImage({
  src,
  publicId,
  cldOptions,
  ...imageProps
}: CloudinaryImageProps) {
  const resolvedPublicId = publicId || extractPublicIdFromUrl(src);
  const canUseCloudinary =
    Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
    Boolean(resolvedPublicId) &&
    isCloudinaryUrl(src);

  if (canUseCloudinary && resolvedPublicId) {
    const { format, quality, ...restCldOptions } = cldOptions ?? {};

    return (
      <CldImage
        {...imageProps}
        {...restCldOptions}
        src={resolvedPublicId}
        format={format ?? 'auto'}
        quality={quality ?? 'auto'}
        priority={imageProps.priority}
      />
    );
  }

  return <Image {...imageProps} src={src} />;
}








