import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Reuses existing connection in warm serverless invocations.
 * Creates a new connection only on cold starts.
 */
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  let uri = process.env.MONGODB_URI;
  if (!uri) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'backend', '.env')
      ];
      for (const p of candidates) {
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
      uri = process.env.MONGODB_URI;
    } catch {}
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set. Add it in Vercel Dashboard → Settings → Environment Variables.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('portfolio');

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

// ─── Portfolio CRUD ─────────────────────────────────────────

export async function getPortfolio() {
  const { db } = await connectToDatabase();
  const doc = await db.collection('portfolio').findOne({ _type: 'main' });
  if (doc) {
    const { _id, _type, ...data } = doc;
    return data;
  }
  return null;
}

export async function savePortfolio(data) {
  const { db } = await connectToDatabase();
  await db.collection('portfolio').updateOne(
    { _type: 'main' },
    { $set: { ...data, _type: 'main', _updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
  return true;
}

// ─── OTP Management ─────────────────────────────────────────

export async function getActiveOtp() {
  const { db } = await connectToDatabase();
  const doc = await db.collection('auth').findOne({ _type: 'otp' });
  if (doc && (Date.now() - new Date(doc.createdAt).getTime() < 5 * 60 * 1000)) {
    return doc.code;
  }
  // Expired or not found
  if (doc) {
    await db.collection('auth').deleteOne({ _type: 'otp' });
  }
  return null;
}

export async function setActiveOtp(code) {
  const { db } = await connectToDatabase();
  await db.collection('auth').updateOne(
    { _type: 'otp' },
    { $set: { _type: 'otp', code, createdAt: new Date().toISOString() } },
    { upsert: true }
  );
}

export async function deleteActiveOtp() {
  const { db } = await connectToDatabase();
  await db.collection('auth').deleteOne({ _type: 'otp' });
}

// ─── Passkey Management ─────────────────────────────────────

export async function getStoredPasskey() {
  const { db } = await connectToDatabase();
  const doc = await db.collection('auth').findOne({ _type: 'passkey' });
  return doc?.passkey || null;
}

export async function setStoredPasskey(passkey) {
  const { db } = await connectToDatabase();
  await db.collection('auth').updateOne(
    { _type: 'passkey' },
    { $set: { _type: 'passkey', passkey, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

// ─── In-Memory Cache (per warm function instance) ───────────

const cacheStore = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getCachedData(key, forceRefresh = false) {
  if (forceRefresh) return null;
  const entry = cacheStore.get(key);
  if (entry && (Date.now() - entry.timestamp < CACHE_TTL_MS)) {
    return entry.data;
  }
  return null;
}

export function setCachedData(key, data) {
  cacheStore.set(key, { data, timestamp: Date.now() });
}
