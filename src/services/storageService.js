import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';

export function hasCloudinaryCredentials() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads buffer to Cloudinary if configured; otherwise saves to local ./uploads/ fallback.
 */
export async function storeUploadedFile(file, { folder = 'ssc-uploads', uploadDir = './uploads' } = {}) {
  if (hasCloudinaryCredentials()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
    });

    return {
      storageProvider: 'cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const safeBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeBase}`;
  const fullPath = path.join(uploadDir, filename);
  await fs.writeFile(fullPath, file.buffer);

  return {
    storageProvider: 'local-fallback',
    url: `/uploads/${filename}`,
    publicId: filename,
  };
}
