import pool from '../config/db.js';

const createBarTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bar (
            bcode VARCHAR(255) PRIMARY KEY,
            eid INT NOT NULL,
            uid INT NOT NULL,
            "desc" TEXT,
            CONSTRAINT fk_bar_event FOREIGN KEY (eid) REFERENCES event (eid) ON DELETE RESTRICT,
            CONSTRAINT fk_bar_user FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE RESTRICT
        )
    `;

    // Migration for existing databases:
    // - rename bid -> bcode and cast to text
    // - drop default (serial), drop bname, enforce PK on bcode
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
    const ensurePrimaryKey = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'bar' AND constraint_type = 'PRIMARY KEY'
            ) THEN
                ALTER TABLE bar ADD PRIMARY KEY (bcode);
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
        await pool.query(ensurePrimaryKey);
        console.log('Bar table created/updated successfully');
    } catch (error) {
        console.error('Error creating bar table', error);
        throw error;
    }
};

export default createBarTable;
