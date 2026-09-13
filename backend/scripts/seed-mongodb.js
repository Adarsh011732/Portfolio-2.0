import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or backend
const envPaths = [
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
    break;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not defined in your .env file.');
  console.error('Please add: MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority\n');
  process.exit(1);
}

const portfolioJsonPath = path.resolve(__dirname, '..', 'data', 'portfolio.json');

if (!fs.existsSync(portfolioJsonPath)) {
  console.error(`\n❌ ERROR: ${portfolioJsonPath} not found.\n`);
  process.exit(1);
}

async function seed() {
  console.log('\n⏳ Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully.');

    const db = client.db('portfolio');
    const collection = db.collection('portfolio');
    const authCollection = db.collection('auth');

    const portfolioRaw = fs.readFileSync(portfolioJsonPath, 'utf8');
    const portfolioData = JSON.parse(portfolioRaw);

    console.log(`📦 Seeding portfolio data (${portfolioData.projects?.length || 0} projects, ${portfolioData.certifications?.length || 0} certifications)...`);

    await collection.updateOne(
      { _type: 'main' },
      {
        $set: {
          ...portfolioData,
          _type: 'main',
          _updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    console.log('✅ Portfolio data saved to MongoDB collection "portfolio"');

    // Default passkey initialization if not already set
    const defaultPasskey = process.env.OWNER_PASSKEY || '9369';
    const existingPasskey = await authCollection.findOne({ _type: 'passkey' });
    if (!existingPasskey) {
      await authCollection.updateOne(
        { _type: 'passkey' },
        { $set: { _type: 'passkey', passkey: defaultPasskey, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      console.log(`🔐 Owner passkey initialized (default: ${defaultPasskey})`);
    } else {
      console.log('🔐 Existing owner passkey retained.');
    }

    console.log('\n🎉 MongoDB setup and seeding complete! Your database is ready for Vercel deployment.\n');
  } catch (err) {
    console.error('❌ Failed to seed MongoDB:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
