-- Base de datos para Sistema de Gestión Vehicular
-- Creado: 2025-12-28
-- Motor: MySQL 8.0+

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gestion_vehiculos 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE gestion_vehiculos;

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    photo VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de mantenimientos de vehículos
CREATE TABLE IF NOT EXISTS maintenances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    plate VARCHAR(20) NOT NULL,
    category VARCHAR(40) NOT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    mileage INT NULL,
    cost DECIMAL(12, 2) NULL,
    provider VARCHAR(120) NULL,
    status ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO') NOT NULL DEFAULT 'REALIZADO',
    next_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenances_plate (plate),
    INDEX idx_maintenances_date (maintenance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Inspecciones Vehiculares
CREATE TABLE IF NOT EXISTS inspections (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

USE gestion_vehiculos;

INSERT INTO inspections (
    plate,
    internal_number,
    company_name,
    service_point,
    route,
    model_year,
    vehicle_type,
    driver_name,
    driver_phone,
    owner_name,
    preoperational_check,
    preoperational_file,

    -- Condiciones generales
    espejos,
    vidrios,
    limpiabrisas,
    llantas_del,
    llantas_tras,
    tanque,
    escape,
    bodegas,
    ruidos,
    pisos,
    manijas,
    vehicle_conditions,
    vehicle_status_files,

    -- Luces
    pito,
    luces_bajas,
    luces_altas,
    exploradoras_delanteras,
    luces_direccionales,
    luces_parqueo,
    luces_navegacion,
    luces_freno,
    luz_reversa,
    pito_reversa,
    luces_internas,
    television_tdt,
    radio_parlantes,
    lighting_conditions,
    lighting_files,

    -- Tablero
    velocimetro,
    odometro,
    tacometro,
    termometro,
    manometro_aire,
    gasometro,
    control_velocidad,
    dashboard_conditions,
    dashboard_files,

    -- Seguridad
    puertas_ascenso,
    gps,
    claraboya,
    cinturones,
    botiquin,
    extintor,
    conos_chaleco,
    equipo_carretera,
    kit_ambiental,
    distintivo_escolar,
    senalizacion,
    rotulado_quimico,
    epps,
    safety_observations,
    safety_files,

    -- Orden y aseo
    limpieza_exterior,
    silleria,
    bano,
    caneca_basura,
    palomeras,
    pasillos,
    cleaning_observations,
    cleaning_files,

    -- Documentación
    soat,
    rtm_ley,
    rtm_preventiva,
    poliza,
    convenio,
    fuec,
    tarjeta_operacion,
    licencia_conductor,
    documentation_observations,
    documentation_files,

    -- Fugas
    aceite_motor,
    agua,
    transmision,
    liquido_frenos,
    liquido_bateria,
    sistema_neumatico,
    leaks_observations,
    leaks_files,

    -- Inspector
    inspector_name,
    inspector_position
)
VALUES (
    'ABC123',
    '001',
    'ALFATRANS',
    'Bogotá',
    'Ruta de prueba',
    2024,
    'Bus',
    'Juan Pérez',
    '3001234567',
    'ALFATRANS',
    1,
    NULL,

    -- Condiciones generales
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'Vehículo en buenas condiciones generales',
    JSON_ARRAY(),

    -- Luces
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'Todas las luces funcionan correctamente',
    JSON_ARRAY(),

    -- Tablero
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'Tablero en condiciones normales',
    JSON_ARRAY(),

    -- Seguridad
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'Elementos de seguridad completos',
    JSON_ARRAY(),

    -- Orden y aseo
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'Vehículo limpio y organizado',
    JSON_ARRAY(),

    -- Documentación
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'VIGENTE',
    'Documentación completa y vigente',
    JSON_ARRAY(),

    -- Fugas
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'CUMPLE',
    'No se evidencian fugas',
    JSON_ARRAY(),

    -- Inspector
    'Carlos Inspector',
    'Supervisor'
);