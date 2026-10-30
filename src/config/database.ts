// src/config/database.ts
import env from './env';
import { Pool, PoolConfig, QueryResult } from 'pg';

class Database {
    private pool: Pool;

    constructor() {
        const poolConfig: PoolConfig = {
            host: env.database.host,
            port: env.database.port,
            user: env.database.user,
            password: env.database.password,
            database: env.database.database,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            // For production with SSL:
            // ssl: {
            //   rejectUnauthorized: false
            // }
        };

        this.pool = new Pool(poolConfig);

        this.pool.on('connect', () => {
            console.log('Connected to PostgreSQL database');
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    async executeQuery(text: string, params: unknown[] = []): Promise<QueryResult> {
        const client = await this.pool.connect();
        try {
            const start = Date.now();
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            console.log(`Executed query: ${text} - Duration: ${duration}ms`);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async initializeTables(): Promise<void> {
        try {
            await this.executeQuery(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    fname VARCHAR(50) NOT NULL,
                    lname VARCHAR(50) NOT NULL,
                    age INT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            console.log('Users table created or already exists');

            await this.executeQuery(`
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    sku VARCHAR(30) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
                    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);

            await this.executeQuery(`
                CREATE TABLE IF NOT EXISTS sales (
                    id SERIAL PRIMARY KEY,
                    sale_reference VARCHAR(30) UNIQUE NOT NULL,
                    customer_name VARCHAR(100) NOT NULL,
                    sale_date DATE NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);

            await this.executeQuery(`
                CREATE TABLE IF NOT EXISTS sale_items (
                    id SERIAL PRIMARY KEY,
                    sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
                    product_id INT NOT NULL REFERENCES products(id),
                    quantity INT NOT NULL CHECK (quantity > 0),
                    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
                    UNIQUE (sale_id, product_id)
                )
            `);

            await this.seedSalesData();
            console.log('Database schema initialized successfully');
        } catch (err) {
            console.error('Error initializing database:', err);
            throw err;
        }
    }

    private async seedSalesData(): Promise<void> {
        await this.executeQuery(`
            INSERT INTO products (sku, name, category, unit_price, stock_quantity)
            VALUES
                ('KB-001', 'Mechanical Keyboard', 'Accessories', 89.99, 24),
                ('MS-001', 'Wireless Mouse', 'Accessories', 34.50, 40),
                ('MN-001', '27-inch Monitor', 'Displays', 249.00, 12),
                ('HB-001', 'USB-C Hub', 'Accessories', 45.75, 30),
                ('ST-001', 'Laptop Stand', 'Office', 59.90, 18)
            ON CONFLICT (sku) DO NOTHING
        `);

        await this.executeQuery(`
            INSERT INTO sales (sale_reference, customer_name, sale_date)
            VALUES
                ('SALE-2025-0001', 'Amina Otieno', '2025-01-15'),
                ('SALE-2025-0002', 'Brian Mutua', '2025-02-03'),
                ('SALE-2025-0003', 'Cynthia Okello', '2025-02-21')
            ON CONFLICT (sale_reference) DO NOTHING
        `);

        await this.executeQuery(`
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
            SELECT s.id, p.id, seed.quantity, seed.unit_price
            FROM (VALUES
                ('SALE-2025-0001', 'KB-001', 1, 89.99::NUMERIC),
                ('SALE-2025-0001', 'MS-001', 1, 34.50::NUMERIC),
                ('SALE-2025-0002', 'MN-001', 2, 249.00::NUMERIC),
                ('SALE-2025-0002', 'HB-001', 1, 45.75::NUMERIC),
                ('SALE-2025-0003', 'ST-001', 1, 59.90::NUMERIC),
                ('SALE-2025-0003', 'MS-001', 2, 34.50::NUMERIC)
            ) AS seed(sale_reference, sku, quantity, unit_price)
            JOIN sales s ON s.sale_reference = seed.sale_reference
            JOIN products p ON p.sku = seed.sku
            ON CONFLICT (sale_id, product_id) DO NOTHING
        `);
    }

    getPool(): Pool {
        return this.pool;
    }
}

// Create singleton instance
const db = new Database();

// Export instance methods and the database object
export const executeQuery = (text: string, params: any[] = []) => db.executeQuery(text, params);
export const initializeTables = () => db.initializeTables();
export default db;