import db, { executeQuery } from "../config/database";

// User interface defining the structure of user data
export interface TUser {
    id?: number;
    fname: string;
    lname: string;
    age: number;
    created_at?: Date;
}

// Insert a single user into the database
export const insertOneUser = async (user: TUser): Promise<number | undefined> => {
    try {
        const res = await executeQuery(
            'INSERT INTO users (fname, lname, age) VALUES ($1, $2, $3) RETURNING id',
            [user.fname, user.lname, user.age]
        );
        const userId = res.rows[0]?.id;
        console.log(`User inserted with ID: ${userId}`);
        return userId;
    } catch (err) {
        console.error('Error inserting data:', err);
        throw err;
    }
}


// Insert multiple users into the database
export const insertMultipleUsers = async (users: TUser[]): Promise<void> => {
    // For multiple users, using a transaction is better
    const client = await db.getPool().connect();
    try {
        // Begin transaction
        await client.query('BEGIN');

        // Insert each user
        for (const user of users) {
            await client.query(
                'INSERT INTO users (fname, lname, age) VALUES ($1, $2, $3)',
                [user.fname, user.lname, user.age]
            );
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log(`${users.length} users inserted successfully`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error inserting multiple users:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Query all users from the database
export const query = async (): Promise<TUser[]> => {
    try {
        const res = await executeQuery('SELECT * FROM users');
        console.log(`Retrieved ${res.rows.length} users`);
        return res.rows as TUser[];
    } catch (err) {
        console.error('Error querying data:', err);
        throw err;
    }
};
export const deleteUserById = async (id: number): Promise<boolean> => {
    try {
        const res = await executeQuery('DELETE FROM users WHERE id = $1', [id]);
        console.log(`Deleted user with ID ${id}`);
        return (res.rowCount ?? 0) > 0;
    } catch (err) {
        console.error(`Error deleting user with ID ${id}:`, err);
        throw err;
    }
};
export const deleteUsersByFirstName = async (fname: string): Promise<number> => {
    try {
        const res = await executeQuery('DELETE FROM users WHERE fname = $1', [fname]);
        console.log(`Deleted ${res.rowCount} user(s) with fname '${fname}'`);
        return res.rowCount ?? 0;
    } catch (err) {
        console.error(`Error deleting users with fname '${fname}':`, err);
        throw err;
    }
};
//deleting by age range
export const deleteUsersByAgeRange = async (minAge: number, maxAge: number): Promise<number> => {
    try {
        const res = await executeQuery('DELETE FROM users WHERE age BETWEEN $1 AND $2', [minAge, maxAge]);
        console.log(`Deleted ${res.rowCount} user(s) aged between ${minAge} and ${maxAge}`);
        return res.rowCount ?? 0;
    } catch (err) {
        console.error(`Error deleting users in age range:`, err);
        throw err;
    }
};


// delete all users from the database
export const deleteAllUsers = async (): Promise<void> => {
    try {
        const res = await executeQuery('DELETE FROM users');
        console.log(`Deleted ${res.rowCount} users`);
    } catch (err) {
        console.error('Error deleting data:', err);
        throw err;
    }
}
//deleting one user by 1d
export const deleteOneUser =async (): Promise<void> =>{
    try{
        const res=await executeQuery('DELETE FROM Users WHERE id =1');
        console.log(`Deleted ${res.rowCount} user(s)`);
    }catch (err){
        console.error('Error deleting data :',err);
        throw err;
    }

}