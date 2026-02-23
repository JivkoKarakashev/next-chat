import { Pool } from 'pg';

declare global {
  // prevent hot-reload pool duplication in dev
  var pgPool: Pool | undefined;
}

const pool: Pool = global.pgPool ?? new Pool({
  connectionString: process.env.POSTGRES_URL
});

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export {
  pool
}