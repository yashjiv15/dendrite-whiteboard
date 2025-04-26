import { Pool } from 'pg';

// PostgreSQL connection setup
export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'collab_board',
  password: 'root',
  port: 5432,
});
