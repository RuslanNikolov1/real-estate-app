import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Track if Cloudinary has been configured
let cloudinaryConfigured = false;

/**
 * Configure Cloudinary (lazy initialization for serverless)
 * This ensures configuration only happens when needed
 */
function ensureCloudinaryConfigured(): void {
  if (cloudinaryConfigured) {
    return;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  cloudinaryConfigured = true;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer to upload
 * @param folder - Optional folder name (default: 'properties')
 * @returns Promise with secure_url and public_id
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = 'properties'
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result || !result.secure_url || !result.public_id) {
          reject(new Error('Invalid upload result from Cloudinary'));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Convert buffer to stream
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary by public_id
 * @param publicId - The public_id of the file to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureCloudinaryConfigured();

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
    throw error;
  }
}

/**
 * Delete multiple files from Cloudinary
 * @param publicIds - Array of public_ids to delete
 * @returns Promise that resolves when all deletions are complete
 */
export async function deleteMultipleFromCloudinary(
  publicIds: string[]
): Promise<void> {
  if (publicIds.length === 0) return;

  ensureCloudinaryConfigured();

  try {
    await Promise.allSettled(publicIds.map((id) => deleteFromCloudinary(id)));
  } catch (error) {
    console.error('Failed to delete some files from Cloudinary:', error);
    // Don't throw - we want to continue even if some deletions fail
  }
}
