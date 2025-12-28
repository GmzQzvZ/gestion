import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import { pool } from '../db.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: function (req, _file, cb) { 
    const plate = req.body.plate || 'unknown';
    const vehicleDir = path.join(uploadsDir, plate.replace(/[^a-zA-Z0-9]/g, '_'));
    fs.mkdirSync(vehicleDir, { recursive: true });
    cb(null, vehicleDir); 
  },
  filename: function (_req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'inspection-' + unique + ext);
  }
});

const upload = multer({ storage });

// Función para manejar archivos múltiples
const handleMultipleFiles = (files, plate) => {
  if (!files) return null;
  const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '_');
  return files.map(file => `/uploads/${cleanPlate}/${file.filename}`);
};

// List inspections
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, plate, internal_number, company_name, service_point, route, 
             model_year, vehicle_type, driver_name, inspector_name, 
             inspector_position, created_at 
      FROM inspections 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Error al obtener inspecciones' });
  }
});

// Get inspection by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inspections WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Inspección no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({ error: 'Error al obtener inspección' });
  }
});

// Create inspection
router.post('/', upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'vehicle_status', maxCount: 5 },
  { name: 'lighting_status', maxCount: 5 },
  { name: 'dashboard_files', maxCount: 5 },
  { name: 'safety_evidence', maxCount: 5 },
  { name: 'cleaning_evidence', maxCount: 5 },
  { name: 'documentation_evidence', maxCount: 5 },
  { name: 'leaks_evidence', maxCount: 5 }
]), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      plate, internal_number, company_name, service_point, route, model_year,
      vehicle_type, driver_name, driver_phone, owner_name, preoperational_check,
      
      // Condiciones generales
      espejos, vidrios, limpiabrisas, llantas_del, llantas_tras, tanque,
      escape, bodegas, ruidos, pisos, manijas, vehicle_conditions,
      
      // Luces
      pito, luces_bajas, luces_altas, exploradoras_delanteras, luces_direccionales,
      luces_parqueo, luces_navegacion, luces_freno, luz_reversa, pito_reversa,
      luces_internas, television_tdt, radio_parlantes, lighting_conditions,
      
      // Tablero
      velocimetro, odometro, tacometro, termometro, manometro_aire, gasometro,
      control_velocidad, dashboard_conditions,
      
      // Seguridad
      puertas_ascenso, gps, claraboya, cinturones, botiquin, extintor,
      conos_chaleco, equipo_carretera, kit_ambiental, distintivo_escolar,
      senalizacion, rotulado_quimico, epps, safety_observations,
      
      // Orden y aseo
      limpieza_exterior, silleria, bano, caneca_basura, palomeras, pasillos,
      cleaning_observations,
      
      // Documentación
      soat, rtm_ley, rtm_preventiva, poliza, convenio, fuec, tarjeta_operacion,
      licencia_conductor, documentation_observations,
      
      // Fugas y escapes
      aceite_motor, agua, transmision, liquido_frenos, liquido_bateria,
      sistema_neumatico, leaks_observations,
      
      // Inspector
      inspector_name, inspector_position
    } = req.body;

    // Procesar archivos
    const preoperational_file = req.files.template ? `/uploads/${plate.replace(/[^a-zA-Z0-9]/g, '_')}/${req.files.template[0].filename}` : null;
    const vehicle_status_files = handleMultipleFiles(req.files.vehicle_status, plate);
    const lighting_files = handleMultipleFiles(req.files.lighting_status, plate);
    const dashboard_files_json = handleMultipleFiles(req.files.dashboard_files, plate);
    const safety_files = handleMultipleFiles(req.files.safety_evidence, plate);
    const cleaning_files = handleMultipleFiles(req.files.cleaning_evidence, plate);
    const documentation_files = handleMultipleFiles(req.files.documentation_evidence, plate);
    const leaks_files = handleMultipleFiles(req.files.leaks_evidence, plate);

    const sql = `
      INSERT INTO inspections (
        plate, internal_number, company_name, service_point, route, model_year,
        vehicle_type, driver_name, driver_phone, owner_name, preoperational_check,
        preoperational_file, espejos, vidrios, limpiabrisas, llantas_del, llantas_tras,
        tanque, escape, bodegas, ruidos, pisos, manijas, vehicle_conditions,
        vehicle_status_files, pito, luces_bajas, luces_altas, exploradoras_delanteras,
        luces_direccionales, luces_parqueo, luces_navegacion, luces_freno,
        luz_reversa, pito_reversa, luces_internas, television_tdt, radio_parlantes,
        lighting_conditions, lighting_files, velocimetro, odometro, tacometro,
        termometro, manometro_aire, gasometro, control_velocidad, dashboard_conditions,
        dashboard_files, puertas_ascenso, gps, claraboya, cinturones, botiquin, extintor,
        conos_chaleco, equipo_carretera, kit_ambiental, distintivo_escolar, senalizacion,
        rotulado_quimico, epps, safety_observations, safety_files, limpieza_exterior,
        silleria, bano, caneca_basura, palomeras, pasillos, cleaning_observations,
        cleaning_files, soat, rtm_ley, rtm_preventiva, poliza, convenio, fuec,
        tarjeta_operacion, licencia_conductor, documentation_observations,
        documentation_files, aceite_motor, agua, transmision, liquido_frenos,
        liquido_bateria, sistema_neumatico, leaks_observations, leaks_files,
        inspector_name, inspector_position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      plate, internal_number, company_name, service_point, route, model_year,
      vehicle_type, driver_name, driver_phone, owner_name, preoperational_check,
      preoperational_file, espejos, vidrios, limpiabrisas, llantas_del, llantas_tras,
      tanque, escape, bodegas, ruidos, pisos, manijas, vehicle_conditions,
      JSON.stringify(vehicle_status_files), pito, luces_bajas, luces_altas, exploradoras_delanteras,
      luces_direccionales, luces_parqueo, luces_navegacion, luces_freno,
      luz_reversa, pito_reversa, luces_internas, television_tdt, radio_parlantes,
      lighting_conditions, JSON.stringify(lighting_files), velocimetro, odometro, tacometro,
      termometro, manometro_aire, gasometro, control_velocidad, dashboard_conditions,
      JSON.stringify(dashboard_files_json), puertas_ascenso, gps, claraboya, cinturones, botiquin, extintor,
      conos_chaleco, equipo_carretera, kit_ambiental, distintivo_escolar, senalizacion,
      rotulado_quimico, epps, safety_observations, JSON.stringify(safety_files), limpieza_exterior,
      silleria, bano, caneca_basura, palomeras, pasillos, cleaning_observations,
      JSON.stringify(cleaning_files), soat, rtm_ley, rtm_preventiva, poliza, convenio, fuec,
      tarjeta_operacion, licencia_conductor, documentation_observations,
      JSON.stringify(documentation_files), aceite_motor, agua, transmision, liquido_frenos,
      liquido_bateria, sistema_neumatico, leaks_observations, JSON.stringify(leaks_files),
      inspector_name, inspector_position
    ];

    const [result] = await pool.execute(sql, values);
    const [rows] = await pool.query('SELECT * FROM inspections WHERE id = ?', [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating inspection:', error);
    res.status(500).json({ error: 'Error al crear inspección' });
  }
});

// Delete inspection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inspections WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Inspección no encontrada' });

    await pool.execute('DELETE FROM inspections WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(500).json({ error: 'Error al eliminar inspección' });
  }
});

export default router;
