import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { pool } from '../db.js';

const router = Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

router.get('/', async (req, res) => {
  try {
    const plate = typeof req.query.plate === 'string' ? req.query.plate.trim() : '';
    const query = plate
      ? 'SELECT * FROM maintenances WHERE plate = ? ORDER BY maintenance_date DESC, id DESC'
      : 'SELECT * FROM maintenances ORDER BY maintenance_date DESC, id DESC';
    const [rows] = await pool.query(query, plate ? [plate] : []);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    res.status(500).json({ error: 'Error al obtener mantenimientos' });
  }
});

router.post('/',
  body('name').isString().trim().isLength({ min: 2, max: 120 }),
  body('plate').isString().trim().isLength({ min: 1, max: 20 }),
  body('category').isString().trim().isLength({ min: 2, max: 40 }),
  body('maintenance_date').isISO8601().toDate(),
  body('maintenance_type').isString().trim().isLength({ min: 2, max: 80 }),
  body('description').isString().trim().isLength({ min: 2 }),
  body('mileage').optional({ values: 'falsy' }).isInt({ min: 0 }).toInt(),
  body('cost').optional({ values: 'falsy' }).isFloat({ min: 0 }).toFloat(),
  body('provider').optional({ values: 'falsy' }).isString().trim().isLength({ max: 120 }),
  body('status').optional().isIn(['PROGRAMADO', 'REALIZADO', 'CANCELADO']),
  body('next_date').optional({ values: 'falsy' }).isISO8601().toDate(),
  body('notes').optional({ values: 'falsy' }).isString().trim(),
  handleValidation,
  async (req, res) => {
    try {
      const {
        name, plate, category, maintenance_date, maintenance_type, description, mileage,
        cost, provider, status, next_date, notes
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO maintenances
          (name, plate, category, maintenance_date, maintenance_type, description, mileage, cost, provider, status, next_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, plate, category, maintenance_date, maintenance_type, description, mileage || null,
          cost || null, provider || null, status || 'REALIZADO', next_date || null, notes || null]
      );
      const [rows] = await pool.query('SELECT * FROM maintenances WHERE id = ?', [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating maintenance:', error);
      res.status(500).json({ error: 'Error al registrar mantenimiento' });
    }
  }
);

router.delete('/:id',
  param('id').isInt().toInt(),
  handleValidation,
  async (req, res) => {
    try {
      const [result] = await pool.execute('DELETE FROM maintenances WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Mantenimiento no encontrado' });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      res.status(500).json({ error: 'Error al eliminar mantenimiento' });
    }
  }
);

export default router;