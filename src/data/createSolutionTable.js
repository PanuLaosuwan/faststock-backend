import pool from '../config/db.js';

const createSolutionTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS solution (
            sol_id SERIAL PRIMARY KEY,
            pid INT NOT NULL,
            use_pid INT NOT NULL,
            use_vol DOUBLE PRECISION NOT NULL,
            CONSTRAINT fk_solution_product FOREIGN KEY (pid) REFERENCES product (pid) ON DELETE CASCADE,
            CONSTRAINT fk_solution_use_product FOREIGN KEY (use_pid) REFERENCES product (pid) ON DELETE RESTRICT
        )
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Solution table created successfully');
    } catch (error) {
        console.error('Error creating solution table', error);
        throw error;
    }
};

export default createSolutionTable;
