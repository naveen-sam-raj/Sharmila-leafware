import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isMongoConnected = false;

const FALLBACK_DB_PATH = path.join(__dirname, '../data/fallback_db.json');

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sharmila_leafware';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to ${mongoURI}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] Could not connect to MongoDB (${err.message}). Using local datastore fallback.`);
    initFallbackStorage();
  }
}

let fallbackData = {
  users: [],
  categories: [],
  products: []
};

function initFallbackStorage() {
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(FALLBACK_DB_PATH)) {
    try {
      const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
      fallbackData = JSON.parse(data);
    } catch (e) {
      console.error('Error reading fallback db:', e);
    }
  } else {
    saveFallbackStorage();
  }
}

export function saveFallbackStorage() {
  try {
    const dir = path.dirname(FALLBACK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(fallbackData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving fallback db:', e);
  }
}

export function getFallbackData() {
  return fallbackData;
}
