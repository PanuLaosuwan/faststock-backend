import pool from '../config/db.js';

const createStockTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS stock (
            bcode VARCHAR(255) NOT NULL,
            sdate DATE NOT NULL,
            pid INT NOT NULL,
            start_quantity INT NOT NULL,
            start_subquantity DOUBLE PRECISION,
            end_quantity INT NOT NULL,
            end_subquantity DOUBLE PRECISION,
            "desc" TEXT,
            PRIMARY KEY (bcode, sdate, pid),
            CONSTRAINT fk_stock_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE,
            CONSTRAINT fk_stock_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    const migrateBidToBcode = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'stock' AND column_name = 'bid'
            ) THEN
                ALTER TABLE stock RENAME COLUMN bid TO bcode;
            END IF;
        END$$;
    `;

    const castBcodeToText = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'stock' AND column_name = 'bcode'
                      AND data_type <> 'character varying'
            ) THEN
                ALTER TABLE stock ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);
            END IF;
        END$$;
    `;

    const ensureBcodeNotNull = `ALTER TABLE stock ALTER COLUMN bcode SET NOT NULL`;
    const recreateFk = `
        ALTER TABLE stock DROP CONSTRAINT IF EXISTS fk_stock_bar;
        ALTER TABLE stock ADD CONSTRAINT fk_stock_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(migrateBidToBcode);
        await pool.query(castBcodeToText);
        await pool.query(ensureBcodeNotNull);
        await pool.query(recreateFk);
        console.log('Stock table created/updated successfully');
    } catch (error) {
        console.error('Error creating stock table', error);
        throw error;
    }
};

export default createStockTable;
