import { initializeTables } from './config/database';
import { query, insertMultipleUsers, insertOneUser, TUser, deleteAllUsers } from './examples/basic-query'
const { Pool } = require('pg');

// Self-executing async function to run the imported code
(async () => {
    try {
        // user operations

        // 1. Create tables if it doesn't exist
        await initializeTables();

        // 2. Insert a test user
        const userId = await insertOneUser({ fname: 'John', lname: 'Doe', age: 30 });
        console.log(`Inserted user with ID: ${userId}`);

        // 3. Insert multiple users with a transaction
        const usersToInsert: TUser[] = [
  { fname: 'Alice', lname: 'Njeri', age: 27 },
  { fname: 'Brian', lname: 'Mutua', age: 34 },
  { fname: 'Cynthia', lname: 'Okello', age: 22 },
  { fname: 'Daniel', lname: 'Mwangi', age: 30 },
  { fname: 'Esther', lname: 'Wambui', age: 25 },
  { fname: 'Felix', lname: 'Odhiambo', age: 29 },
  { fname: 'Grace', lname: 'Kiptoo', age: 33 },
  { fname: 'Henry', lname: 'Chebet', age: 26 },
  { fname: 'Irene', lname: 'Mumo', age: 31 },
  { fname: 'Jacob', lname: 'Achieng', age: 24 },
];

        await insertMultipleUsers(usersToInsert);

        // 4. Query all users to verify
        const users = await query();
        console.log('All users in database:');
        // Drop all tables to delete the whole database
        // const pool = new Pool(); // Uses environment variables for config

        // await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        // await pool.end();
        // console.log('Database schema dropped and recreated (all data deleted).');
        // 5. Delete all users
//         const usersTodelete: TUser[] = [
//   { fname: 'Alice', lname: 'Njeri', age: 27 },
//   { fname: 'Brian', lname: 'Mutua', age: 34 },
//   { fname: 'Cynthia', lname: 'Okello', age: 22 },
//   { fname: 'Daniel', lname: 'Mwangi', age: 30 },
//   { fname: 'Esther', lname: 'Wambui', age: 25 },
//   { fname: 'Felix', lname: 'Odhiambo', age: 29 },
//   { fname: 'Grace', lname: 'Kiptoo', age: 33 },
//   { fname: 'Henry', lname: 'Chebet', age: 26 },
//   { fname: 'Irene', lname: 'Mumo', age: 31 },
//   { fname: 'Jacob', lname: 'Achieng', age: 24 },
// ];


        // await deleteAllUsers();

        console.log('All operations completed successfully');
    } catch (error) {
        console.error('Error executing database operations:', error);
    }
})();