import db, { executeQuery, initializeTables } from './config/database';

type ProductSeed = {
    sku: string;
    name: string;
    category: string;
    unitPrice: number;
    stockQuantity: number;
};

type SaleSeed = {
    reference: string;
    customerName: string;
    saleDate: string;
};

type SaleItemSeed = {
    saleReference: string;
    sku: string;
    quantity: number;
    unitPrice: number;
};

const products: ProductSeed[] = [
    { sku: 'KB-001', name: 'Mechanical Keyboard', category: 'Accessories', unitPrice: 89.99, stockQuantity: 24 },
    { sku: 'MS-001', name: 'Wireless Mouse', category: 'Accessories', unitPrice: 34.50, stockQuantity: 40 },
    { sku: 'MN-001', name: '27-inch Monitor', category: 'Displays', unitPrice: 249.00, stockQuantity: 12 },
    { sku: 'HB-001', name: 'USB-C Hub', category: 'Accessories', unitPrice: 45.75, stockQuantity: 30 },
    { sku: 'ST-001', name: 'Laptop Stand', category: 'Office', unitPrice: 59.90, stockQuantity: 18 },
];

const sales: SaleSeed[] = [
    { reference: 'SALE-2025-0001', customerName: 'Amina Otieno', saleDate: '2025-01-15' },
    { reference: 'SALE-2025-0002', customerName: 'Brian Mutua', saleDate: '2025-02-03' },
    { reference: 'SALE-2025-0003', customerName: 'Cynthia Okello', saleDate: '2025-02-21' },
];

const saleItems: SaleItemSeed[] = [
    { saleReference: 'SALE-2025-0001', sku: 'KB-001', quantity: 1, unitPrice: 89.99 },
    { saleReference: 'SALE-2025-0001', sku: 'MS-001', quantity: 1, unitPrice: 34.50 },
    { saleReference: 'SALE-2025-0002', sku: 'MN-001', quantity: 2, unitPrice: 249.00 },
    { saleReference: 'SALE-2025-0002', sku: 'HB-001', quantity: 1, unitPrice: 45.75 },
    { saleReference: 'SALE-2025-0003', sku: 'ST-001', quantity: 1, unitPrice: 59.90 },
    { saleReference: 'SALE-2025-0003', sku: 'MS-001', quantity: 2, unitPrice: 34.50 },
];

export async function seedDatabase(): Promise<void> {
    await initializeTables();

    for (const product of products) {
        await executeQuery(
            `INSERT INTO products (sku, name, category, unit_price, stock_quantity)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (sku) DO NOTHING`,
            [product.sku, product.name, product.category, product.unitPrice, product.stockQuantity],
        );
    }

    for (const sale of sales) {
        await executeQuery(
            `INSERT INTO sales (sale_reference, customer_name, sale_date)
             VALUES ($1, $2, $3)
             ON CONFLICT (sale_reference) DO NOTHING`,
            [sale.reference, sale.customerName, sale.saleDate],
        );
    }

    for (const item of saleItems) {
        await executeQuery(
            `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
             SELECT s.id, p.id, $3, $4
             FROM sales s
             JOIN products p ON p.sku = $2
             WHERE s.sale_reference = $1
             ON CONFLICT (sale_id, product_id) DO NOTHING`,
            [item.saleReference, item.sku, item.quantity, item.unitPrice],
        );
    }
}

seedDatabase()
    .then(() => console.log('Sample sales data seeded successfully'))
    .catch((error: unknown) => {
        console.error('Error seeding sample sales data:', error);
        process.exitCode = 1;
    })
    .finally(() => db.getPool().end());
