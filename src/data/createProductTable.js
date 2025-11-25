import pool from '../config/db.js';

const createProductTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS product (
            pid SERIAL PRIMARY KEY,
            pname VARCHAR(255) NOT NULL,
            vol DOUBLE PRECISION,
            volunit TEXT,
            category VARCHAR(255) NOT NULL,
            unit TEXT NOT NULL,
            factor DOUBLE PRECISION NOT NULL,
            subunit TEXT NOT NULL,
            "desc" TEXT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Product table created successfully');
    } catch (error) {
        console.error('Error creating product table', error);
        throw error;
    }
};

export default createProductTable;
