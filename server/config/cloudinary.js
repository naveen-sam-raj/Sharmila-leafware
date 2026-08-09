import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Helper to sanitize environment variable string (strips quotes, whitespace, and newlines)
function sanitizeEnv(val) {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '').trim();
}

export function configureCloudinary() {
  const cloud_name = sanitizeEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = sanitizeEnv(process.env.CLOUDINARY_API_KEY);
  const api_secret = sanitizeEnv(process.env.CLOUDINARY_API_SECRET);

  // Prevent CLOUDINARY_URL environment variable from overriding individual credentials
  delete process.env.CLOUDINARY_URL;

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return { cloud_name, api_key, api_secret };
}

// Initial configuration call
configureCloudinary();

export default cloudinary;
