import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

// console.log(process.env.DB_USER);
// console.log(process.env.DB_HOST);
// console.log(process.env.DB_NAME);
// console.log(process.env.DB_PASSWORD);
// console.log(process.env.DB_PORT);

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

pool.on('error', (err) => {
    console.error('Error with the database', err);
});

export default pool;