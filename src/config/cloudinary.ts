import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function getPhotosInFolder(
  folder: string,
  maxResults = 500
): Promise<CloudinaryPhoto[]> {
  const results: CloudinaryPhoto[] = [];
  let nextCursor: string | undefined;

  do {
    const response = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: Math.min(maxResults - results.length, 100),
      next_cursor: nextCursor,
      resource_type: 'image',
    });

    for (const resource of response.resources) {
      results.push({
        cloudinaryId: resource.public_id,
        url: resource.secure_url,
        thumbnailUrl: cloudinary.url(resource.public_id, {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        }),
        width: resource.width,
        height: resource.height,
      });
    }

    nextCursor = response.next_cursor;
  } while (nextCursor && results.length < maxResults);

  return results;
}

export interface CloudinaryPhoto {
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}
