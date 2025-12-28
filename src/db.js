import mysql from 'mysql2/promise';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gestion_vehiculos'
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export async function initDb(){
  const vehiclesSql = `CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    photo VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const inspectionsSql = `CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(20) NOT NULL,
    internal_number VARCHAR(20),
    company_name VARCHAR(100),
    service_point VARCHAR(100),
    route VARCHAR(200),
    model_year INT,
    vehicle_type VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    owner_name VARCHAR(100),
    preoperational_check BOOLEAN,
    preoperational_file VARCHAR(255),
    
    -- Condiciones generales del vehículo
    espejos ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    vidrios ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    limpiabrisas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    llantas_del ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    llantas_tras ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    tanque ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    escape ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    bodegas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    ruidos ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    pisos ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    manijas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    vehicle_conditions TEXT,
    vehicle_status_files JSON,
    
    -- Condiciones de las luces
    pito ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_bajas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_altas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    exploradoras_delanteras ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_direccionales ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_parqueo ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_navegacion ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_freno ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luz_reversa ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    pito_reversa ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    luces_internas ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    television_tdt ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    radio_parlantes ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    lighting_conditions TEXT,
    lighting_files JSON,
    
    -- Tablero de indicadores
    velocimetro ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    odometro ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    tacometro ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    termometro ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    manometro_aire ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    gasometro ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    control_velocidad ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    dashboard_conditions TEXT,
    dashboard_files JSON,
    
    -- Elementos de seguridad
    puertas_ascenso ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    gps ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    claraboya ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    cinturones ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    botiquin ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    extintor ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    conos_chaleco ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    equipo_carretera ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    kit_ambiental ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    distintivo_escolar ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    senalizacion ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    rotulado_quimico ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    epps ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    safety_observations TEXT,
    safety_files JSON,
    
    -- Orden y aseo
    limpieza_exterior ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    silleria ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    bano ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    caneca_basura ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    palomeras ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    pasillos ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    cleaning_observations TEXT,
    cleaning_files JSON,
    
    -- Documentación
    soat ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    rtm_ley ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    rtm_preventiva ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    poliza ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    convenio ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    fuec ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    tarjeta_operacion ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    licencia_conductor ENUM('VIGENTE', 'VENCIDO', 'NO_CUMPLE'),
    documentation_observations TEXT,
    documentation_files JSON,
    
    -- Fugas y escapes
    aceite_motor ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    agua ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    transmision ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    liquido_frenos ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    liquido_bateria ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    sistema_neumatico ENUM('CUMPLE', 'NO_CUMPLE', 'NO_APLICA'),
    leaks_observations TEXT,
    leaks_files JSON,
    
    -- Información del inspector
    inspector_name VARCHAR(100) NOT NULL,
    inspector_position VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  await pool.query(vehiclesSql);
  await pool.query(inspectionsSql);
}
