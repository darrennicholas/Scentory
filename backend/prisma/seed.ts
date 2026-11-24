import 'dotenv/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Concentration, FragranceFamily, NoteCategory, NoteLayer, PrismaClient, Priority } from '@prisma/client';

const prisma = new PrismaClient();
const key = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const noteSeeds = [
  { name: 'Bergamot', category: NoteCategory.CITRUS, description: 'Bright citrus peel with a refined, gently bitter finish.' },
  { name: 'Pink Pepper', category: NoteCategory.SPICY, description: 'A lively, rosy spice that adds sparkle to the opening.' },
  { name: 'Jasmine', category: NoteCategory.FLORAL, description: 'A soft white floral note with a warm, luminous character.' },
  { name: 'Cedarwood', category: NoteCategory.WOODY, description: 'Dry, clean wood with a calm and polished trail.' },
  { name: 'Vanilla', category: NoteCategory.SWEET, description: 'A smooth sweetness that rounds the fragrance.' },
  { name: 'Amber', category: NoteCategory.RESINOUS, description: 'A warm resinous accord with a soft golden depth.' },
  { name: 'Musk', category: NoteCategory.MUSKY, description: 'A gentle skin-like note that softens the dry down.' },
];

const perfumeSeeds = [
  {
    id: 'e2000000-0000-4000-8000-000000000001', name: 'Citrus Reverie', brand: 'Atelier Scentory',
    concentration: Concentration.EAU_DE_PARFUM, fragranceFamily: FragranceFamily.CITRUS, volumeMl: 50,
    description: 'A bright bergamot opening settles into a soft floral heart and a clean, comforting base.',
    purchasePrice: '1850000.00', purchaseDate: new Date('2026-09-12T00:00:00.000Z'),
    imageUrl: '/storage/images/perfume-citrus-reverie.webp',
    notes: [['Bergamot', NoteLayer.TOP], ['Jasmine', NoteLayer.MIDDLE], ['Musk', NoteLayer.BASE]],
  },
  {
    id: 'e2000000-0000-4000-8000-000000000002', name: 'Ambre Nocturne', brand: 'Atelier Scentory',
    concentration: Concentration.PARFUM, fragranceFamily: FragranceFamily.AMBER, volumeMl: 75,
    description: 'A warm evening composition of pink pepper, glowing amber, and smooth vanilla.',
    purchasePrice: '2460000.00', purchaseDate: new Date('2026-10-03T00:00:00.000Z'),
    imageUrl: '/storage/images/perfume-ambre-nocturne.webp',
    notes: [['Pink Pepper', NoteLayer.TOP], ['Amber', NoteLayer.MIDDLE], ['Vanilla', NoteLayer.BASE]],
  },
  {
    id: 'e2000000-0000-4000-8000-000000000003', name: 'Bois de Minuit', brand: 'Atelier Scentory',
    concentration: Concentration.EXTRAIT_DE_PARFUM, fragranceFamily: FragranceFamily.WOODY, volumeMl: 100,
    description: 'A quiet woody scent built around cedarwood, amber, and a soft musky finish.',
    purchasePrice: '3190000.00', purchaseDate: new Date('2026-10-20T00:00:00.000Z'),
    imageUrl: '/storage/images/perfume-bois-de-minuit.webp',
    notes: [['Bergamot', NoteLayer.TOP], ['Cedarwood', NoteLayer.MIDDLE], ['Amber', NoteLayer.BASE], ['Musk', NoteLayer.BASE]],
  },
] as const;

const collectionSeeds = [
  {
    id: 'e3000000-0000-4000-8000-000000000001', name: 'Scentory Morning Ritual',
    description: 'Fresh, clear fragrances for the first hours of the day.',
    coverImageUrl: '/storage/images/collection-morning-ritual.webp', perfumeIds: [perfumeSeeds[0].id],
  },
  {
    id: 'e3000000-0000-4000-8000-000000000002', name: 'Scentory Evening Archive',
    description: 'Warm, expressive scents saved for slower evenings.',
    coverImageUrl: '/storage/images/collection-evening-archive.webp', perfumeIds: [perfumeSeeds[1].id, perfumeSeeds[2].id],
  },
];

const reviewSeeds = [
  { perfumeId: perfumeSeeds[0].id, overallRating: 4, longevityRating: 3, projectionRating: 4, reviewText: 'Bright and easy to wear; the soft musk stays close through the afternoon.', testedDate: new Date('2026-10-22T00:00:00.000Z') },
  { perfumeId: perfumeSeeds[1].id, overallRating: 5, longevityRating: 5, projectionRating: 4, reviewText: 'A smooth amber dry down with a memorable, elegant warmth.', testedDate: new Date('2026-10-28T00:00:00.000Z') },
];

const wishlistSeeds = [
  { id: 'e5000000-0000-4000-8000-000000000001', name: 'Rose Velours', brand: 'Maison Scentory', concentration: Concentration.EAU_DE_PARFUM, fragranceFamily: FragranceFamily.FLORAL, estimatedPrice: '2100000.00', priority: Priority.HIGH, notes: 'A rose-forward scent to explore next.', imageUrl: '/storage/images/wishlist-rose-velours.webp' },
  { id: 'e5000000-0000-4000-8000-000000000002', name: 'Thé Blanc', brand: 'Maison Scentory', concentration: Concentration.EAU_DE_TOILETTE, fragranceFamily: FragranceFamily.FRESH, estimatedPrice: '1450000.00', priority: Priority.MEDIUM, notes: 'Look for a clean, airy tea accord.', imageUrl: '/storage/images/wishlist-the-blanc.webp' },
  { id: 'e5000000-0000-4000-8000-000000000003', name: 'Cuir d’Automne', brand: 'Maison Scentory', concentration: Concentration.PARFUM, fragranceFamily: FragranceFamily.LEATHER, estimatedPrice: null, priority: Priority.LOW, notes: 'A leather fragrance for cooler weather.', imageUrl: '/storage/images/wishlist-cuir-automne.webp' },
];

async function main() {
  const imagePaths = [
    ...perfumeSeeds.map(perfume => perfume.imageUrl),
    ...collectionSeeds.map(collection => collection.coverImageUrl),
    ...wishlistSeeds.map(item => item.imageUrl),
  ];
  if (new Set(imagePaths).size !== imagePaths.length) throw new Error('Every seeded image must use a distinct local path.');
  const missingImages = imagePaths.filter(imageUrl => !existsSync(path.resolve(__dirname, '../../storage/public/images', path.basename(imageUrl))));
  if (missingImages.length) throw new Error(`Seed images not found: ${missingImages.join(', ')}`);

  await prisma.$transaction(async tx => {
    const noteIds = new Map<string, string>();
    for (const note of noteSeeds) {
      const saved = await tx.fragranceNote.upsert({
        where: { nameKey: key(note.name) },
        update: {},
        create: { ...note, nameKey: key(note.name) },
      });
      noteIds.set(note.name, saved.id);
    }

    for (const perfume of perfumeSeeds) {
      const { notes, ...data } = perfume;
      const links = notes.map(([name, layer]) => ({ noteId: noteIds.get(name)!, layer }));
      await tx.perfume.upsert({
        where: { id: perfume.id },
        create: { ...data, notes: { create: links } },
        update: { ...data, notes: { deleteMany: {}, create: links } },
      });
    }

    for (const collection of collectionSeeds) {
      const { perfumeIds, ...data } = collection;
      await tx.collection.upsert({
        where: { id: collection.id },
        create: { ...data, nameKey: key(data.name), perfumes: { create: perfumeIds.map(perfumeId => ({ perfumeId })) } },
        update: { ...data, nameKey: key(data.name), perfumes: { deleteMany: {}, create: perfumeIds.map(perfumeId => ({ perfumeId })) } },
      });
    }

    for (const [index, review] of reviewSeeds.entries()) {
      await tx.review.upsert({
        where: { perfumeId: review.perfumeId },
        create: { id: `e4000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, ...review },
        update: review,
      });
    }

    for (const item of wishlistSeeds) {
      await tx.wishlistItem.upsert({ where: { id: item.id }, create: item, update: item });
    }
  });

  console.log(`Seed complete: ${noteSeeds.length} notes, ${perfumeSeeds.length} perfumes, ${collectionSeeds.length} collections, ${reviewSeeds.length} reviews, ${wishlistSeeds.length} wishlist items. Insights are derived from these records.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
