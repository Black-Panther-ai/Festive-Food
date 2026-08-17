export const CLOUDINARY_CONFIG = {
  cloudName: 'ddeks9vjg',
  apiKey: '129858218277614',
  apiSecret: 'atcnR2A258agH7N1J5JLIqWBCXA',
  folder: 'up_festive_foods/products',
};

/**
 * Computes SHA-1 hash for Cloudinary signed direct client upload
 */
async function computeSha1(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads an image file or base64 directly to Cloudinary CDN from browser.
 * Works seamlessly on GitHub Pages, Netlify, Vercel, and local servers!
 */
export async function uploadDirectToCloudinary(
  fileOrBase64: File | string,
  folder: string = CLOUDINARY_CONFIG.folder
): Promise<{ success: boolean; url: string; publicId?: string; error?: string }> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary signature parameter string in alphabetical order
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
    const signature = await computeSha1(paramsToSign);

    const formData = new FormData();
    formData.append('file', fileOrBase64);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errMsg = errorJson?.error?.message || `Cloudinary upload failed (${response.status})`;
      console.warn('Direct Cloudinary signed upload issue:', errMsg);

      // Fallback: try unsigned or server
      return { success: false, url: '', error: errMsg };
    }

    const data = await response.json();
    if (data.secure_url || data.url) {
      return {
        success: true,
        url: data.secure_url || data.url,
        publicId: data.public_id,
      };
    }

    return { success: false, url: '', error: 'No secure_url returned by Cloudinary.' };
  } catch (err: any) {
    console.error('Error during direct Cloudinary upload:', err);
    return { success: false, url: '', error: err.message || 'Network error during Cloudinary upload' };
  }
}
