import { Pool } from 'pg';
import { env } from '../env';

declare global {
  // prevent hot-reload pool duplication in dev
  var pgPool: Pool | undefined;
}

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is missing!');
}

const pool: Pool = global.pgPool ??
  new Pool({
    connectionString: env.POSTGRES_URL,
    // ssl: { rejectUnauthorized: false },
  });

pool.query('select 1').then(() => {
  console.log('Postgres connected');
});

if (env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export {
  pool
}