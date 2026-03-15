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

-- Tabla de Inspecciones Vehiculares
