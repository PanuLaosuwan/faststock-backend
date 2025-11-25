import pool from '../config/db.js';

const createBarTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bar (
            bid SERIAL PRIMARY KEY,
            bcode VARCHAR(255) NOT NULL UNIQUE,
            eid INT NOT NULL,
            uid INT NOT NULL,
            "desc" TEXT,
            CONSTRAINT fk_bar_event FOREIGN KEY (eid) REFERENCES event (eid) ON DELETE RESTRICT,
            CONSTRAINT fk_bar_user FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE RESTRICT
        )
    `;

    // Migration for existing databases:
    // - if old schema used bid as int PK or bcode as PK, normalize to: bid SERIAL PK, bcode NOT NULL UNIQUE
    // - remove bname legacy column
    const renameBidToBcode = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'bar' AND column_name = 'bid'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'bar' AND column_name = 'bcode'
            ) THEN
                ALTER TABLE bar RENAME COLUMN bid TO bcode;
            END IF;
        END$$;
    `;

    const castBcodeToText = `
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'bar' AND column_name = 'bcode'
                      AND data_type <> 'character varying'
            ) THEN
                ALTER TABLE bar ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);
            END IF;
        END$$;
    `;

    const dropBcodeDefault = `ALTER TABLE bar ALTER COLUMN bcode DROP DEFAULT`;
    const dropBnameIfExists = `ALTER TABLE bar DROP COLUMN IF EXISTS bname`;
    const ensureBcodeNotNull = `ALTER TABLE bar ALTER COLUMN bcode SET NOT NULL`;

    const addBidColumn = `ALTER TABLE bar ADD COLUMN IF NOT EXISTS bid INTEGER`;
    const createBidSequence = `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bar_bid_seq') THEN
                CREATE SEQUENCE bar_bid_seq OWNED BY bar.bid;
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'bar' AND column_name = 'bid' AND column_default LIKE 'nextval%'
            ) THEN
                ALTER TABLE bar ALTER COLUMN bid SET DEFAULT nextval('bar_bid_seq');
            END IF;
            PERFORM setval('bar_bid_seq', COALESCE((SELECT MAX(bid) FROM bar), 0));
            UPDATE bar SET bid = nextval('bar_bid_seq') WHERE bid IS NULL;
            ALTER TABLE bar ALTER COLUMN bid SET NOT NULL;
        END$$;
    `;

    const dropOldPrimaryKey = `ALTER TABLE bar DROP CONSTRAINT IF EXISTS bar_pkey CASCADE`;
    const addBcodeUnique = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'bar' AND constraint_type = 'UNIQUE' AND constraint_name = 'bar_bcode_key'
            ) THEN
                ALTER TABLE bar ADD CONSTRAINT bar_bcode_key UNIQUE (bcode);
            END IF;
        END$$;
    `;

    const ensurePrimaryKey = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'bar' AND constraint_type = 'PRIMARY KEY'
            ) THEN
                ALTER TABLE bar ADD CONSTRAINT bar_bid_pkey PRIMARY KEY (bid);
            END IF;
        END$$;
    `;

    const recreateFkStock = `
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock') THEN
                BEGIN
                    ALTER TABLE stock DROP CONSTRAINT IF EXISTS fk_stock_bar;
                    ALTER TABLE stock ADD CONSTRAINT fk_stock_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;
                EXCEPTION WHEN undefined_table THEN
                    NULL;
                END;
            END IF;
        END$$;
    `;

    const recreateFkLost = `
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lost') THEN
                BEGIN
                    ALTER TABLE lost DROP CONSTRAINT IF EXISTS fk_lost_bar;
                    ALTER TABLE lost ADD CONSTRAINT fk_lost_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;
                EXCEPTION WHEN undefined_table THEN
                    NULL;
                END;
            END IF;
        END$$;
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(renameBidToBcode);
        await pool.query(castBcodeToText);
        await pool.query(dropBcodeDefault);
        await pool.query(dropBnameIfExists);
        await pool.query(ensureBcodeNotNull);
        await pool.query(addBidColumn);
        await pool.query(createBidSequence);
        await pool.query(dropOldPrimaryKey);
        await pool.query(addBcodeUnique);
        await pool.query(ensurePrimaryKey);
        await pool.query(recreateFkStock);
        await pool.query(recreateFkLost);
        console.log('Bar table created/updated successfully');
    } catch (error) {
        console.error('Error creating bar table', error);
        throw error;
    }
};

export default createBarTable;
