import pool from '../config/db.js';

const createEventTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS event (
            eid SERIAL PRIMARY KEY,
            ename VARCHAR(255) NOT NULL,
            edate_start DATE NOT NULL,
            edate_end DATE NOT NULL,
            day INT NOT NULL,
            location VARCHAR(255),
            "desc" TEXT
        )
    `;

    // Ensure legacy tables get the new column
    const addLocationColumnQuery = `
        ALTER TABLE event
        ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(addLocationColumnQuery);
        console.log('Event table created successfully');
    } catch (error) {
        console.error('Error creating event table', error);
        throw error;
    }
};

export default createEventTable;
