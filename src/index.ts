// src/index.ts
import pool from './db';

async function setupTables() {
  // Create tables (if not exists)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "third year" (
      "YEAR OF STUDY" INT PRIMARY KEY,
      name VARCHAR(50)
    );
    
    CREATE TABLE IF NOT EXISTS "second year" (
      "YEAR OF STUDY" INT PRIMARY KEY,
      name VARCHAR(50)
    );
  `);
  await pool.query(`
    INSERT INTO "third year" ("YEAR OF STUDY", name)
    VALUES
      (1, 'Alice'),
      (2, 'Bob')
    ON CONFLICT ("YEAR OF STUDY") DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO "second year" ("YEAR OF STUDY", name)
    VALUES
      (1, 'Charlie'),
      (2, 'David')
    ON CONFLICT ("YEAR OF STUDY") DO NOTHING;
  `);

  // Query data
  const thirdYearResult = await pool.query(`SELECT * FROM "third year"`);
  const secondYearResult = await pool.query(`SELECT * FROM "second year"`);

  console.log('Third Year Students:', thirdYearResult.rows);
  console.log('Second Year Students:', secondYearResult.rows);
}

setupTables()
  .catch(console.error)
  .finally(() => pool.end());

