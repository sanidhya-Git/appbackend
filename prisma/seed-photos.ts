import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const FACE_SERVICE_URL = 'http://localhost:8000';

// Cloudinary sample images that exist in the account
const CLOUDINARY_SAMPLES = [
  { id: 'sample', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037289/sample.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/sample.jpg' },
  { id: 'cld-sample', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/cld-sample.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/cld-sample.jpg' },
  { id: 'cld-sample-2', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/cld-sample-2.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/cld-sample-2.jpg' },
  { id: 'cld-sample-3', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/cld-sample-3.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/cld-sample-3.jpg' },
  { id: 'cld-sample-4', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/cld-sample-4.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/cld-sample-4.jpg' },
  { id: 'cld-sample-5', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/cld-sample-5.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/cld-sample-5.jpg' },
  { id: 'main-sample', url: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/v1780037318/main-sample.jpg', thumb: 'https://res.cloudinary.com/dfl2uxv7b/image/upload/w_400,h_400,c_fill/main-sample.jpg' },
];

async function extractFacesFromUrl(url: string) {
  try {
    const res = await axios.post(`${FACE_SERVICE_URL}/extract-embeddings-url`, { url }, { timeout: 15000 });
    return res.data as { embedding: number[]; quality: number; bbox: object }[];
  } catch {
    return [];
  }
}

async function seedPhotosForEvent(eventId: string, eventFolder: string, photoCount: number) {
  // Assign sample images cyclically to create enough photos
  const photos = [];
  for (let i = 0; i < photoCount; i++) {
    const sample = CLOUDINARY_SAMPLES[i % CLOUDINARY_SAMPLES.length];
    photos.push({
      cloudinaryId: `${eventFolder}/photo_${i + 1}`,
      url: sample.url,
      thumbnailUrl: sample.thumb,
      width: 1280,
      height: 960,
      eventId,
    });
  }

  await prisma.photo.createMany({ data: photos, skipDuplicates: true });
  console.log(`  Created ${photos.length} photos for event`);

  // Process each photo through face service
  const createdPhotos = await prisma.photo.findMany({ where: { eventId, isProcessed: false } });
  let processedCount = 0;

  for (const photo of createdPhotos) {
    const faceDataList = await extractFacesFromUrl(photo.url);

    if (faceDataList.length > 0) {
      await prisma.faceRegion.createMany({
        data: faceDataList.map((fd) => ({
          photoId: photo.id,
          embedding: fd.embedding,
          bbox: fd.bbox,
          confidence: fd.quality,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.photo.update({
      where: { id: photo.id },
      data: { isProcessed: true, faceCount: faceDataList.length },
    });
    processedCount++;
    process.stdout.write(`\r  Processed ${processedCount}/${createdPhotos.length} photos`);
  }
  console.log('');

  await prisma.event.update({
    where: { id: eventId },
    data: { totalPhotos: createdPhotos.length, isProcessed: true },
  });
}

async function main() {
  console.log('Seeding photos for all events...\n');

  const events = await prisma.event.findMany();
  if (events.length === 0) {
    console.error('No events found. Run npm run seed first.');
    process.exit(1);
  }

  const photoCounts = [12, 10, 8];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const count = photoCounts[i] ?? 8;
    console.log(`Event: ${event.name}`);

    // Skip if already has photos
    const existing = await prisma.photo.count({ where: { eventId: event.id } });
    if (existing > 0) {
      console.log(`  Already has ${existing} photos, skipping.\n`);
      continue;
    }

    await seedPhotosForEvent(event.id, event.cloudinaryFolder, count);
    console.log(`  Done.\n`);
  }

  console.log('Photo seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
