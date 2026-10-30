// src/config/env.ts
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({
    path: envPath
  });

  if (result.error && fs.existsSync(envPath)) {
    console.error('Error loading .env file:', result.error);
  }
}

const requiredProductionVariables = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'];

if (isProduction) {
  const missingVariables = requiredProductionVariables.filter((variable) => !process.env[variable]);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingVariables.join(', ')}`
    );
  }
}

export default {
  database: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'TYPESCRIPT',
  }
};