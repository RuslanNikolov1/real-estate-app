/**
 * Compress an image file to reduce its size
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1920)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @param maxSizeMB - Maximum file size in MB (default: 2MB)
 * @returns Compressed File or original file if compression fails
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85,
  maxSizeMB: number = 2
): Promise<File> {
  // If file is already small enough, return as-is
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original
          return;
        }
        
        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original
              return;
            }
            
            // If compressed size is still too large, reduce quality further (but avoid infinite recursion)
            if (blob.size > maxSizeBytes && quality > 0.5) {
              // Recursively compress with lower quality, but use current compressed blob as base
              const img = new Image();
              img.onload = () => {
                const smallerCanvas = document.createElement('canvas');
                smallerCanvas.width = width;
                smallerCanvas.height = height;
                const smallerCtx = smallerCanvas.getContext('2d');
                if (smallerCtx) {
                  smallerCtx.drawImage(img, 0, 0, width, height);
                  smallerCanvas.toBlob(
                    (smallerBlob) => {
                      if (smallerBlob) {
                        const finalFile = new File([smallerBlob], file.name, {
                          type: 'image/jpeg',
                          lastModified: Date.now(),
                        });
                        resolve(finalFile);
                      } else {
                        resolve(file);
                      }
                    },
                    'image/jpeg',
                    Math.max(0.5, quality - 0.15)
                  );
                } else {
                  resolve(file);
                }
              };
              img.src = URL.createObjectURL(blob);
              return;
            }
            
            // Create new File from blob
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }
            );
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        resolve(file); // Fallback to original on error
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve(file); // Fallback to original on error
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeMB?: number;
  }
): Promise<File[]> {
  const promises = files.map(file => compressImage(
    file,
    options?.maxWidth,
    options?.maxHeight,
    options?.quality,
    options?.maxSizeMB
  ));
  
  return Promise.all(promises);
}
