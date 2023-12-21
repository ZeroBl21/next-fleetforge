import pkg from 'pg';

const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: '',
  port: +process.env.DB_PORT!,
});

// eslint-disable-next-line import/no-anonymous-default-export
export default pool
