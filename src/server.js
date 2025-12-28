import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb } from './db.js';
import vehiclesRouter from './vehicles/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// Middlewares
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Static frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Routes
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/vehicles', vehiclesRouter);

// Fallback to index.html for SPA routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Init DB and start
await initDb().catch(err => {
  console.error('Error inicializando la base de datos:', err);
  process.exit(1);
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
