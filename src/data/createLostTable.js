import pool from '../config/db.js';

const createLostTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS lost (
            bid INT NOT NULL,
            sdate DATE NOT NULL,
            pid INT NOT NULL,
            category VARCHAR(255) NOT NULL,
            receiver VARCHAR(255),
            quantity INT NOT NULL,
            subquantity DOUBLE PRECISION,
            "desc" TEXT,
            PRIMARY KEY (bid, sdate, pid),
            CONSTRAINT fk_lost_bar FOREIGN KEY (bid) REFERENCES bar (bid) ON DELETE CASCADE,
            CONSTRAINT fk_lost_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Lost table created successfully');
    } catch (error) {
        console.error('Error creating lost table', error);
        throw error;
    }
};

export default createLostTable;
