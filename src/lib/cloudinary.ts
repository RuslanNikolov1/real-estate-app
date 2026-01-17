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
  try {
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
      const errorText = await response.text();
      console.error('Failed to get signed upload parameters:', response.status, errorText);
      throw new Error(`Failed to get signed upload parameters: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get signed upload parameters');
  }
};

/**
 * Upload file to Cloudinary using signed upload
 */
export const uploadToCloudinary = async (
  file: File,
  folder?: string
): Promise<CloudinaryMetadata> => {
  // Validate file
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(`File must be an image. Received type: ${file.type}`);
  }

  // Get signed upload parameters
  let params;
  try {
    params = await getSignedUploadParams(file, folder);
  } catch (error) {
    console.error('Failed to get signed upload parameters:', error);
    throw new Error(`Failed to get signed upload parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', params.signature);
  formData.append('timestamp', params.timestamp.toString());
  formData.append('api_key', params.api_key);
  if (params.folder) {
    formData.append('folder', params.folder);
  }

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  console.log('Uploading to Cloudinary:', {
    url: cloudinaryUrl,
    folder: params.folder,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  let response;
  try {
    response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (networkError) {
    console.error('Network error uploading to Cloudinary:', networkError);
    throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to Cloudinary'}`);
  }

  if (!response.ok) {
    // Try to get error details from response
    let errorMessage = `Cloudinary upload failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      console.error('Cloudinary upload error response:', errorData);
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } catch {
      // If we can't parse error, use status text
      const errorText = await response.text().catch(() => '');
      console.error('Cloudinary upload error (text):', errorText);
      errorMessage = `Cloudinary upload failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`;
    }
    throw new Error(errorMessage);
  }

  const data: CloudinaryUploadResponse = await response.json();

  if (!data.public_id || !data.secure_url) {
    console.error('Invalid Cloudinary response:', data);
    throw new Error('Invalid response from Cloudinary: missing public_id or secure_url');
  }

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




















