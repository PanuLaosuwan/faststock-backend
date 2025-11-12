const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: 'db',
  user: 'postgres',
  password: 'password',
  database: 'mydb',
});

const verifyConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed', error);
  }
};

verifyConnection();

app.get('/test1', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', serverTime: result.rows[0].now });
  } catch (error) {
    console.error('Connectivity check failed', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.get('/test2', (req, res) => {
  res.json({ message: 'test2 route ready' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
