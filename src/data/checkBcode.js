import pool from '../config/db.js';

const tables = ['bar', 'stock', 'lost'];

const run = async () => {
    try {
        const result = await pool.query(
            `
            SELECT
                table_name,
                column_name,
                data_type,
                character_maximum_length,
                column_default,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = ANY($1::text[])
              AND column_name = 'bcode'
            ORDER BY table_name;
            `,
            [tables]
        );

        console.log('bcode columns:');
        result.rows.forEach((row) => {
            console.log(row);
        });
    } catch (error) {
        console.error('Error checking bcode columns', error);
    } finally {
        await pool.end();
    }
};

run();
