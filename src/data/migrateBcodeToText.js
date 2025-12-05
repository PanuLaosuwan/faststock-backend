import pool from '../config/db.js';

const statements = [
    // Normalize bar.bcode to varchar
    `ALTER TABLE IF EXISTS bar ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);`,
    `ALTER TABLE IF EXISTS bar ALTER COLUMN bcode DROP DEFAULT;`,

    // Normalize stock.bcode to varchar and fix FK
    `ALTER TABLE IF EXISTS stock DROP CONSTRAINT IF EXISTS fk_stock_bar;`,
    `ALTER TABLE IF EXISTS stock ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);`,
    `ALTER TABLE IF EXISTS stock ALTER COLUMN bcode DROP DEFAULT;`,
    `ALTER TABLE IF EXISTS stock ADD CONSTRAINT fk_stock_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;`,

    // Normalize lost.bcode to varchar and fix FK (if table exists)
    `ALTER TABLE IF EXISTS lost DROP CONSTRAINT IF EXISTS fk_lost_bar;`,
    `ALTER TABLE IF EXISTS lost ALTER COLUMN bcode TYPE VARCHAR(255) USING bcode::VARCHAR(255);`,
    `ALTER TABLE IF EXISTS lost ALTER COLUMN bcode DROP DEFAULT;`,
    `ALTER TABLE IF EXISTS lost ADD CONSTRAINT fk_lost_bar FOREIGN KEY (bcode) REFERENCES bar (bcode) ON DELETE CASCADE;`
];

const migrate = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const sql of statements) {
            await client.query(sql);
        }
        await client.query('COMMIT');
        console.log('Migration completed: bcode columns normalized to VARCHAR(255)');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

migrate().catch(() => {
    process.exit(1);
});
