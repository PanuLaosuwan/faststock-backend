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

    // Migration: switch from bcode PK to bid PK while preserving data
    const addBidColumn = `ALTER TABLE lost ADD COLUMN IF NOT EXISTS bid INTEGER`;

    const populateBidFromBcode = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns WHERE table_name = 'lost' AND column_name = 'bcode'
            ) THEN
                UPDATE lost l
                SET bid = b.bid
                FROM bar b
                WHERE l.bcode = b.bcode AND l.bid IS NULL;
            END IF;
        END$$;
    `;

    const normalizeBidType = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns WHERE table_name = 'lost' AND column_name = 'bid'
            ) THEN
                ALTER TABLE lost ALTER COLUMN bid TYPE INTEGER USING bid::integer;
            END IF;
        END$$;
    `;

    const dropOldPrimaryKey = `ALTER TABLE lost DROP CONSTRAINT IF EXISTS lost_pkey`;

    const dropOldBarFk = `ALTER TABLE lost DROP CONSTRAINT IF EXISTS fk_lost_bar`;

    const ensureNotNulls = `
        ALTER TABLE lost
            ALTER COLUMN bid SET NOT NULL,
            ALTER COLUMN sdate SET NOT NULL,
            ALTER COLUMN pid SET NOT NULL,
            ALTER COLUMN category SET NOT NULL,
            ALTER COLUMN quantity SET NOT NULL
    `;

    const recreatePrimaryKey = `ALTER TABLE lost ADD CONSTRAINT lost_pkey PRIMARY KEY (bid, sdate, pid)`;

    const recreateBarFk = `
        ALTER TABLE lost
            ADD CONSTRAINT fk_lost_bar FOREIGN KEY (bid) REFERENCES bar (bid) ON DELETE CASCADE
    `;

    const recreateProductFk = `
        ALTER TABLE lost
            DROP CONSTRAINT IF EXISTS fk_lost_product,
            ADD CONSTRAINT fk_lost_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE RESTRICT
    `;

    const dropBcodeColumn = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns WHERE table_name = 'lost' AND column_name = 'bcode'
            ) THEN
                ALTER TABLE lost DROP COLUMN bcode;
            END IF;
        END$$;
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(addBidColumn);
        await pool.query(populateBidFromBcode);
        await pool.query(normalizeBidType);
        await pool.query(dropOldPrimaryKey);
        await pool.query(dropOldBarFk);
        await pool.query(ensureNotNulls);
        await pool.query(recreatePrimaryKey);
        await pool.query(recreateBarFk);
        await pool.query(recreateProductFk);
        await pool.query(dropBcodeColumn);
        console.log('Lost table created/updated successfully');
    } catch (error) {
        console.error('Error creating lost table', error);
        throw error;
    }
};

export default createLostTable;
