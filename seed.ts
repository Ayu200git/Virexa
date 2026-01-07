import { createClient } from 'next-sanity';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Manually load env vars from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_WRITE_TOKEN, // Required for writing
    useCdn: false,
});

async function seed() {
    console.log('Seeding data...');

    if (!process.env.SANITY_API_WRITE_TOKEN) {
        console.error('Error: SANITY_API_WRITE_TOKEN is missing in .env.local');
        process.exit(1);
    }

    // 1. Create Categories
    const yogaCat = await client.createOrReplace({
        _id: 'cat-yoga',
        _type: 'category',
        name: 'Yoga',
        slug: { _type: 'slug', current: 'yoga' },
    });

    const hiitCat = await client.createOrReplace({
        _id: 'cat-hiit',
        _type: 'category',
        name: 'HIIT',
        slug: { _type: 'slug', current: 'hiit' },
    });

    console.log('Categories created.');

    // 2. Create Venue
    const venue = await client.createOrReplace({
        _id: 'venue-central',
        _type: 'venue',
        name: 'Central Studio',
        slug: { _type: 'slug', current: 'central-studio' },
        address: {
            lat: 51.5074,
            lng: -0.1278, // London
            fullAddress: '123 Oxford St, London, UK'
        }
    });
    console.log('Venue created.');

    // 3. Create Activity
    const activity = await client.createOrReplace({
        _id: 'activity-vinyasa',
        _type: 'activity',
        name: 'Vinyasa Flow',
        slug: { _type: 'slug', current: 'vinyasa-flow' },
        duration: 60,
        tierLevel: "basic",
        category: { _type: 'reference', _ref: yogaCat._id },
        instructor: "Sarah Instructor"
    });
    console.log('Activity created.');

    // 4. Create Sessions (Future)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const session = await client.create({
        _type: 'classSession',
        startTime: tomorrow.toISOString(),
        maxCapacity: 20,
        status: 'scheduled',
        activity: { _type: 'reference', _ref: activity._id },
        venue: { _type: 'reference', _ref: venue._id },
    });

    console.log('Session created:', session._id);
    console.log('Seeding complete!');
}

seed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
