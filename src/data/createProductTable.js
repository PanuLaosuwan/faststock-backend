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

    // For existing databases that were created before vol became nullable and volunit was added
    const alterVolNullableQuery = 'ALTER TABLE product ALTER COLUMN vol DROP NOT NULL';
    const addVolunitIfMissingQuery = 'ALTER TABLE product ADD COLUMN IF NOT EXISTS volunit TEXT';

    try {
        await pool.query(createTableQuery);
        await pool.query(alterVolNullableQuery);
        await pool.query(addVolunitIfMissingQuery);
        console.log('Product table created/updated successfully');
    } catch (error) {
        console.error('Error creating product table', error);
        throw error;
    }
};

export default createProductTable;
