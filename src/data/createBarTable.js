import pool from '../config/db.js';

const createBarTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bar (
            bid SERIAL PRIMARY KEY,
            eid INT NOT NULL,
            uid INT NOT NULL,
            bname VARCHAR(255) NOT NULL,
            "desc" TEXT,
            CONSTRAINT fk_bar_event FOREIGN KEY (eid) REFERENCES event (eid) ON DELETE RESTRICT,
            CONSTRAINT fk_bar_user FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE RESTRICT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Bar table created successfully');
    } catch (error) {
        console.error('Error creating bar table', error);
        throw error;
    }
};

export default createBarTable;
