import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, waitForDb } from './db.js';
import tasksRouter from './routes/tasks.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.use('/api/tasks', tasksRouter);

// 404 for unknown API routes
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

waitForDb()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Task Manager API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  });
