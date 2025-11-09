interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

interface CloudinaryMetadata {
  public_id: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Get signed upload parameters from the API
 */
export const getSignedUploadParams = async (
  file: File,
  folder?: string
): Promise<{
  signature: string;
  timestamp: number;
  api_key: string;
  folder?: string;
}> => {
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      folder: folder || 'properties',
      resource_type: file.type.startsWith('video/') ? 'video' : 'image',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get signed upload parameters');
  }

  return response.json();
};

/**
 * Upload file to Cloudinary using signed upload
 */
export const uploadToCloudinary = async (
  file: File,
  folder?: string
): Promise<CloudinaryMetadata> => {
  const params = await getSignedUploadParams(file, folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', params.signature);
  formData.append('timestamp', params.timestamp.toString());
  formData.append('api_key', params.api_key);
  if (params.folder) {
    formData.append('folder', params.folder);
  }

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary');
  }

  const data: CloudinaryUploadResponse = await response.json();

  return {
    public_id: data.public_id,
    url: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    resource_type: data.resource_type,
  };
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_id: publicId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete from Cloudinary');
  }
};










