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
router.post('/', (req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  next();
}, upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'vehicle_status', maxCount: 10 },
  { name: 'lighting_status', maxCount: 10 },
  { name: 'dashboard_files', maxCount: 10 },
  { name: 'safety_evidence', maxCount: 10 },
  { name: 'cleaning_evidence', maxCount: 10 },
  { name: 'documentation_evidence', maxCount: 10 },
  { name: 'leaks_evidence', maxCount: 10 }
]), (req, res, next) => {
  // Este middleware se ejecuta después de Multer
  console.log('Multer procesó correctamente los archivos');
  next();
}, async (req, res) => {
  try {
    console.log('Archivos recibidos:', req.files);
    console.log('Body recibido:', Object.keys(req.body));
    
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
    const dashboard_files = handleMultipleFiles(req.files.dashboard_files, plate);
    const safety_files = handleMultipleFiles(req.files.safety_evidence, plate);
    const cleaning_files = handleMultipleFiles(req.files.cleaning_evidence, plate);
    const documentation_files = handleMultipleFiles(req.files.documentation_evidence, plate);
    const leaks_files = handleMultipleFiles(req.files.leaks_evidence, plate);

    const row = {
      plate,
      internal_number: internal_number || null,
      company_name: company_name || null,
      service_point: service_point || null,
      route: route || null,
      model_year: model_year || null,
      vehicle_type: vehicle_type || null,
      driver_name: driver_name || null,
      driver_phone: driver_phone || null,
      owner_name: owner_name || null,
      preoperational_check: preoperational_check || false,
      preoperational_file: preoperational_file || null,
      espejos: espejos || null,
      vidrios: vidrios || null,
      limpiabrisas: limpiabrisas || null,
      llantas_del: llantas_del || null,
      llantas_tras: llantas_tras || null,
      tanque: tanque || null,
      escape: escape || null,
      bodegas: bodegas || null,
      ruidos: ruidos || null,
      pisos: pisos || null,
      manijas: manijas || null,
      vehicle_conditions: vehicle_conditions || null,
      vehicle_status_files: JSON.stringify(vehicle_status_files || []),
      pito: pito || null,
      luces_bajas: luces_bajas || null,
      luces_altas: luces_altas || null,
      exploradoras_delanteras: exploradoras_delanteras || null,
      luces_direccionales: luces_direccionales || null,
      luces_parqueo: luces_parqueo || null,
      luces_navegacion: luces_navegacion || null,
      luces_freno: luces_freno || null,
      luz_reversa: luz_reversa || null,
      pito_reversa: pito_reversa || null,
      luces_internas: luces_internas || null,
      television_tdt: television_tdt || null,
      radio_parlantes: radio_parlantes || null,
      lighting_conditions: lighting_conditions || null,
      lighting_files: JSON.stringify(lighting_files || []),
      velocimetro: velocimetro || null,
      odometro: odometro || null,
      tacometro: tacometro || null,
      termometro: termometro || null,
      manometro_aire: manometro_aire || null,
      gasometro: gasometro || null,
      control_velocidad: control_velocidad || null,
      dashboard_conditions: dashboard_conditions || null,
      dashboard_files: JSON.stringify(dashboard_files || []),
      puertas_ascenso: puertas_ascenso || null,
      gps: gps || null,
      claraboya: claraboya || null,
      cinturones: cinturones || null,
      botiquin: botiquin || null,
      extintor: extintor || null,
      conos_chaleco: conos_chaleco || null,
      equipo_carretera: equipo_carretera || null,
      kit_ambiental: kit_ambiental || null,
      distintivo_escolar: distintivo_escolar || null,
      senalizacion: senalizacion || null,
      rotulado_quimico: rotulado_quimico || null,
      epps: epps || null,
      safety_observations: safety_observations || null,
      safety_files: JSON.stringify(safety_files || []),
      limpieza_exterior: limpieza_exterior || null,
      silleria: silleria || null,
      bano: bano || null,
      caneca_basura: caneca_basura || null,
      palomeras: palomeras || null,
      pasillos: pasillos || null,
      cleaning_observations: cleaning_observations || null,
      cleaning_files: JSON.stringify(cleaning_files || []),
      soat: soat || null,
      rtm_ley: rtm_ley || null,
      rtm_preventiva: rtm_preventiva || null,
      poliza: poliza || null,
      convenio: convenio || null,
      fuec: fuec || null,
      tarjeta_operacion: tarjeta_operacion || null,
      licencia_conductor: licencia_conductor || null,
      documentation_observations: documentation_observations || null,
      documentation_files: JSON.stringify(documentation_files || []),
      aceite_motor: aceite_motor || null,
      agua: agua || null,
      transmision: transmision || null,
      liquido_frenos: liquido_frenos || null,
      liquido_bateria: liquido_bateria || null,
      sistema_neumatico: sistema_neumatico || null,
      leaks_observations: leaks_observations || null,
      leaks_files: JSON.stringify(leaks_files || []),
      inspector_name,
      inspector_position
    };

    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `
      INSERT INTO inspections (${columns.join(', ')})
      VALUES (${placeholders})
    `;
    const values = columns.map(key => row[key]);

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

// Manejador de errores de Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Error de Multer:', error);
    console.error('Campo no esperado:', error.field);
    console.error('Headers:', req.headers);
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Campo de archivo no esperado', 
        field: error.field,
        message: `El campo '${error.field}' no está configurado para recibir archivos`
      });
    }
    
    return res.status(400).json({ 
      error: 'Error al procesar archivos', 
      details: error.message 
    });
  }
  next();
});

export default router;
