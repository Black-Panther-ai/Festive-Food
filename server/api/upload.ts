import { Request, Response, Router } from 'express';
import { requireAdmin } from '../auth.js';
import { isCloudinaryConfigured, uploadImageToCloudinary } from '../cloudinary.js';

export const uploadRouter = Router();

// Check upload configuration status
uploadRouter.get('/upload/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    cloudinaryConfigured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'ddeks9vjg',
  });
});

// Admin image upload (Base64 or URL -> Cloudinary)
uploadRouter.post('/admin/upload', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data (Base64 data URI or image URL) is required.',
      });
    }

    const uploadResult = await uploadImageToCloudinary(image, folder || 'up_festive_foods/products');

    res.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      provider: uploadResult.provider,
      message:
        uploadResult.provider === 'cloudinary'
          ? 'Image uploaded to Cloudinary successfully!'
          : 'Cloudinary credentials not detected in .env; saved as local data URI.',
    });
  } catch (error: any) {
    console.error('[Upload Endpoint Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image upload failed.',
    });
  }
});
