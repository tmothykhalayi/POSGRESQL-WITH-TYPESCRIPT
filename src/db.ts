// src/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TYPESCRIPT WITH POSGRESQL',
  password: '@2027B3YOND',
  port: 5432,
});

export default pool;
