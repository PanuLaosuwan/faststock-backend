import pool from '../config/db.js';

const createUserTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            uid SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            uname VARCHAR(100) NOT NULL,
            pos VARCHAR(50),
            "desc" TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `;

    const seedUsersQuery = `
        INSERT INTO users (username, password, uname, pos, "desc")
        VALUES
            ('yutha', '$2a$10$MsTGfCWgNjhLRaUhrIFNLu67DERaS9LC8buvBQGmsO7Yb2V.6koY2', 'Yutha Suwannadech', 'Trader', 'Focuses on technical analysis.'),
            ('alice', '$2a$10$L70NN5dJNGTqYS0ZKJoueuZIdgMCNfA2R5ZVEKZ/o0wiBsSJVG9jS', 'Alice Johnson', 'Analyst', 'Loves crunching market data.'),
            ('bob', '$2a$10$cnJLMc2bOKYolxUovyD1B.EwQ/Z26e/qsK50ZnsOFGEBNi42a33nO', 'Bob Smith', 'Advisor', 'Specialises in portfolio strategy.')
        ON CONFLICT (username) DO NOTHING
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(seedUsersQuery);
        console.log('User table created successfully');
    } catch (error) {
        console.error('Error creating user table', error);
        throw error;
    }
};

export default createUserTable;
