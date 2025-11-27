import pool from '../config/db.js';

const createPrestockTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS prestock (
            eid INT NOT NULL,
            pid INT NOT NULL,
            order_quantity INT,
            order_subquantity DOUBLE PRECISION,
            real_quantity INT,
            real_subquantity DOUBLE PRECISION,
            psdate DATE,
            "desc" TEXT,
            PRIMARY KEY (eid, pid),
            CONSTRAINT fk_prestock_event FOREIGN KEY (eid) REFERENCES event (eid) ON DELETE CASCADE,
            CONSTRAINT fk_prestock_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Prestock table created successfully');
    } catch (error) {
        console.error('Error creating prestock table', error);
        throw error;
    }
};

export default createPrestockTable;
