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
import createPrestockTable from './data/createPrestockTable.js';
import createBarTable from './data/createBarTable.js';
import createStockTable from './data/createStockTable.js';
import createLostTable from './data/createLostTable.js';
import createSolutionTable from './data/createSolutionTable.js';
import productRoutes from './routes/productRoutes.js';
import barRoutes from './routes/barRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import prestockRoutes from './routes/prestockRoutes.js';
import lostRoutes from './routes/lostRoutes.js';



dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
app.use('/api', barRoutes);
app.use('/api', stockRoutes);
app.use('/api', prestockRoutes);
app.use('/api', lostRoutes);


//Create User Table
/*
createUserTable();
createEventTable();
createProductTable();
createPrestockTable();
createBarTable();
createStockTable();
createLostTable();
createSolutionTable();
*/

async function initDb() {
  try {
    await createUserTable();
    await createEventTable();
    await createProductTable();
    await createPrestockTable();
    await createBarTable();
    await createStockTable();
    await createLostTable();
    await createSolutionTable();
    console.log('All tables created');
  } catch (err) {
    console.error('Error initializing database', err);
  }
}

initDb();

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
