import pool from '../config/db.js';

const createLostTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS lost (
            bcode VARCHAR(255) NOT NULL,
            sdate DATE NOT NULL,
            pid INT NOT NULL,
            category VARCHAR(255) NOT NULL,
            receiver VARCHAR(255),
            quantity INT NOT NULL,
            subquantity DOUBLE PRECISION,
            "desc" TEXT,
            PRIMARY KEY (bcode, sdate, pid),
            CONSTRAINT fk_lost_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE,
            CONSTRAINT fk_lost_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    const migrateBidToBcode = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'lost' AND column_name = 'bid'
            ) THEN
                ALTER TABLE lost RENAME COLUMN bid TO bcode;
            END IF;
        END$$;
    `;

    const castBcodeToText = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'lost' AND column_name = 'bcode'
                      AND data_type <> 'character varying'
            ) THEN
                ALTER TABLE lost ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);
            END IF;
        END$$;
    `;

    const ensureBcodeNotNull = `ALTER TABLE lost ALTER COLUMN bcode SET NOT NULL`;
    const recreateFk = `
        ALTER TABLE lost DROP CONSTRAINT IF EXISTS fk_lost_bar;
        ALTER TABLE lost ADD CONSTRAINT fk_lost_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(migrateBidToBcode);
        await pool.query(castBcodeToText);
        await pool.query(ensureBcodeNotNull);
        await pool.query(recreateFk);
        console.log('Lost table created/updated successfully');
    } catch (error) {
        console.error('Error creating lost table', error);
        throw error;
    }
};

export default createLostTable;
