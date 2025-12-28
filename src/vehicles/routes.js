import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, param, validationResult } from 'express-validator';
import { pool } from '../db.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, uploadsDir); },
  filename: function (_req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

function handleValidation(req, res, next){
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

// List
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
  res.json(rows);
});

// Get by id
router.get('/:id',
  param('id').isInt().toInt(),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if(rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
});

// Create
router.post('/',
  upload.single('photo'),
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  handleValidation,
  async (req, res) => {
    const { name } = req.body;
    let photo = req.body.photo || null; // URL opcional
    if(req.file){
      photo = `/uploads/${req.file.filename}`;
    }
    const [result] = await pool.execute('INSERT INTO vehicles (name, photo) VALUES (?, ?)', [name, photo]);
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
});

// Update
router.put('/:id',
  upload.single('photo'),
  param('id').isInt().toInt(),
  body('name').optional().isString().trim().isLength({ min: 2, max: 80 }),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let photo = req.body.photo || undefined; // puede venir URL
    if(req.file){
      photo = `/uploads/${req.file.filename}`;
    }

    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if(rows.length === 0) return res.status(404).json({ message: 'No encontrado' });

    const current = rows[0];
    const newName = name !== undefined ? name : current.name;
    const newPhoto = photo !== undefined ? photo : current.photo;

    await pool.execute('UPDATE vehicles SET name = ?, photo = ? WHERE id = ?', [newName, newPhoto, id]);
    const [updated] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json(updated[0]);
});

// Delete
router.delete('/:id',
  param('id').isInt().toInt(),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if(rows.length === 0) return res.status(404).json({ message: 'No encontrado' });

    await pool.execute('DELETE FROM vehicles WHERE id = ?', [id]);
    res.json({ success: true });
});

export default router;
