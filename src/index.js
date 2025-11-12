import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import createUserTable from './data/createUserTable.js';
import createEventTable from './data/createEventTable.js';
import createProductTable from './data/createProductTable.js';
import createBarTable from './data/createBarTable.js';
import createStockTable from './data/createStockTable.js';
import createLostTable from './data/createLostTable.js';
import createSolutionTable from './data/createSolutionTable.js';
import productRoutes from './routes/productRoutes.js';



dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Request logging middleware (moved to top for debugging)
app.use((req, res, next) => {
    console.log(`🌐 INCOMING REQUEST: ${req.method} ${req.url}`);
    next();
});

//Middlewares
app.use(cors());
app.use(express.json());

//Routes

app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', productRoutes);


//Create User Table
createUserTable();
createEventTable();
createProductTable();
createBarTable();
createStockTable();
createLostTable();
createSolutionTable();


//testing the database connection
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error('Error with the database', error);
        res.status(500).json({ error: 'Error with the database' });
    }
});

//Error Handler (should be registered last)
app.use(errorHandler);

//server running
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
