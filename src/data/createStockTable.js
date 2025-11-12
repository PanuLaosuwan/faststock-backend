import pool from '../config/db.js';

const createStockTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS stock (
            bid INT NOT NULL,
            sdate DATE NOT NULL,
            pid INT NOT NULL,
            start_quantity INT NOT NULL,
            start_subquantity DOUBLE PRECISION,
            end_quantity INT NOT NULL,
            end_subquantity DOUBLE PRECISION,
            "desc" TEXT,
            PRIMARY KEY (bid, sdate, pid),
            CONSTRAINT fk_stock_bar FOREIGN KEY (bid) REFERENCES bar (bid) ON DELETE CASCADE,
            CONSTRAINT fk_stock_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Stock table created successfully');
    } catch (error) {
        console.error('Error creating stock table', error);
        throw error;
    }
};

export default createStockTable;
