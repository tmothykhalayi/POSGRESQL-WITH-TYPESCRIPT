# PostgreSQL with TypeScript

A small TypeScript project that demonstrates PostgreSQL connection pooling,
parameterized queries, transactions, table initialization, and relational
sales data using [`node-postgres`](https://node-postgres.com/).

## Features

- TypeScript configured for Node.js with strict checking.
- PostgreSQL connection pooling through `pg`.
- Environment-based database configuration with `dotenv`.
- Parameterized user queries and transaction-based bulk inserts.
- Idempotent creation of `users`, `products`, `sales`, and `sale_items` tables.
- Sample product and sales data inserted automatically on startup.
- Development mode with `nodemon`.

## Requirements

- Node.js 20 or newer
- pnpm 10 or npm
- PostgreSQL 14 or newer
- A PostgreSQL database and user with permission to create tables

## Setup

1. Install dependencies:

   ```powershell
   pnpm install
   ```

2. Create a database named `TYPESCRIPT`:

   ```sql
   CREATE DATABASE "TYPESCRIPT";
   ```

3. Start the project:

   ```powershell
   pnpm dev
   ```

   The application initializes the schema and sample sales data before running
   the example user queries.

For production, do not copy `.env` to the server. Set `NODE_ENV=production`
and provide `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE`
through the hosting platform's environment-variable or secret-management
system, then run:

```powershell
pnpm build
pnpm start
```

The application intentionally does not load `.env` when `NODE_ENV=production`
and exits with an explicit error if a required database variable is missing.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run with automatic restart when `src` changes |
| `pnpm start` | Run the application once |
| `pnpm typecheck` | Check TypeScript without emitting files |
| `pnpm test` | Run the project verification command |
| `pnpm build` | Compile TypeScript into `dist` |

## Database schema

| Table | Purpose |
| --- | --- |
| `users` | Example customer/user records |
| `products` | Product catalog, prices, and stock |
| `sales` | Sale headers and customer information |
| `sale_items` | Products and quantities belonging to each sale |

`initializeTables()` in [`src/config/database.ts`](./src/config/database.ts)
creates missing tables and seeds sample rows using conflict-safe inserts. It
can therefore be run repeatedly without duplicating the sample products or
sales.

The sample data is also available as the TypeScript seed script in
[`src/seed.ts`](./src/seed.ts):

```powershell
pnpm seed
```

## Useful queries

Calculate the total for every sale:

```sql
SELECT
    s.sale_reference,
    s.customer_name,
    SUM(si.quantity * si.unit_price) AS total_amount
FROM sales s
JOIN sale_items si ON si.sale_id = s.id
GROUP BY s.id, s.sale_reference, s.customer_name
ORDER BY s.sale_date;
```

Show product stock:

```sql
SELECT sku, name, category, unit_price, stock_quantity
FROM products
ORDER BY category, name;
```

## Project structure

```text
src/
├── config/
│   ├── database.ts       # Pool, schema initialization, and sample data
│   └── env.ts            # Environment loading and defaults
├── examples/
│   └── basic-query.ts    # User inserts, reads, and deletes
└── index.ts              # Application entry point
```

## Troubleshooting

### Password authentication failed

Confirm that `PGUSER` and `PGPASSWORD` match an actual PostgreSQL role. The
database name is controlled independently by `PGDATABASE`.

### Database does not exist

Create the database shown in `PGDATABASE`, or update the environment variables
to use an existing database. PostgreSQL database names containing uppercase
letters must be quoted when created.

### Port connection refused

Confirm that the PostgreSQL service is running and that `PGPORT` matches the
server port, normally `5432`.

### TypeScript errors

Run:

```powershell
pnpm typecheck
```

## License

This project is available under the license specified in `package.json`.
