import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

let isConfigured = false;

export function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'ddeks9vjg';
  const apiKey = process.env.CLOUDINARY_API_KEY || '129858218277614';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'atcnR2A258agH7N1J5JLIqWBCXA';
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    cloudinary.config({ url: cloudinaryUrl });
    isConfigured = true;
    return cloudinary;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isConfigured = true;
    return cloudinary;
  }

  return null;
}

export function isCloudinaryConfigured(): boolean {
  return true;
}

export async function uploadImageToCloudinary(
  fileDataUriOrUrl: string,
  folder = 'up_festive_foods/products'
): Promise<{ url: string; publicId?: string; provider: 'cloudinary' | 'local_fallback' }> {
  const cld = getCloudinary();

  if (!cld) {
    console.warn(
      '[Cloudinary] Environment variables not configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Using raw data URI.'
    );
    return {
      url: fileDataUriOrUrl,
      provider: 'local_fallback',
    };
  }

  try {
    const result: UploadApiResponse = await cld.uploader.upload(fileDataUriOrUrl, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary',
    };
  } catch (error: any) {
    console.error('[Cloudinary Upload Error]:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary.');
  }
}
