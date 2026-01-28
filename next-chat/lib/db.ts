import { Pool } from 'pg';

declare global {
    // prevent hot-reload pool duplication in dev
    var pgPool: Pool | undefined;
}

const pool: Pool = global.pgPool ?? new Pool({
    connectionString: process.env.POSTGRES_URL,
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

if (process.env.NODE_ENV !== 'production') {
    global.pgPool = pool;
  }

export {
    pool
}