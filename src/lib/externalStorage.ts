/**
 * External Storage Utility
 * Uploads files to storage-consult.saatdigital.com with WebP conversion for images
 */

const STORAGE_BASE_URL = "https://storage-consult.lynkto.site";
const UPLOAD_ENDPOINT = `${STORAGE_BASE_URL}/upload.php`;

/**
 * Convert an image File to WebP format using Canvas API
 * Non-image files are returned as-is
 */
async function convertToWebp(file: File, quality = 0.85): Promise<File> {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff"];

  // Skip if already webp or not an image
  if (file.type === "image/webp" || !imageTypes.includes(file.type)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
          });
          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for WebP conversion"));
    };

    img.src = url;
  });
}

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
}

/**
 * Upload a file to external storage
 * Images are automatically converted to WebP
 * @param file - The file to upload
 * @param folder - Subfolder/property_id for organization (e.g. 'lawyer-photos', 'chat-files/userId')
 */
export async function uploadToExternalStorage(
  file: File,
  folder: string = "general"
): Promise<string> {
  // Convert images to webp
  const processedFile = file.type.startsWith("image/")
    ? await convertToWebp(file)
    : file;

  const formData = new FormData();
  formData.append("file", processedFile);
  formData.append("property_id", folder.replace(/\//g, "_"));

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  const result: UploadResult = await response.json();

  if (!result.success) {
    throw new Error("Upload failed");
  }

  return result.url;
}

/**
 * Upload multiple files to external storage
 */
export async function uploadMultipleToExternalStorage(
  files: File[],
  folder: string = "general"
): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadToExternalStorage(file, folder))
  );
  return results;
}
