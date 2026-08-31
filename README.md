# Backend - Gestión de Vehículos

API REST con Node.js + Express + MySQL. Permite CRUD de vehículos con nombre y foto. Soporta subida de imagen por multipart/form-data y URLs. Sirve las imágenes desde `/uploads`.

## Requisitos
- Node.js 18+
- MySQL 8+

## Instalación
```bash
npm install
cp .env.example .env # en Windows crea .env manualmente y copia los valores
```

Configura las variables en `.env`.

## Base de datos
Ejecuta el script SQL:
```sql
-- En tu cliente MySQL
SOURCE sql/schema.sql;
```

## Ejecutar
Desarrollo (con reinicio automático):
```bash
npm run dev
```
Producción:
```bash
npm start
```

El servidor corre en `http://localhost:3000/` por defecto cuando ejecutas `npm run dev` o `npm start`.

## Endpoints
- GET `/api/vehicles` -> lista
- GET `/api/vehicles/:id` -> detalle
- POST `/api/vehicles` -> crear (multipart o JSON)
- PUT `/api/vehicles/:id` -> actualizar (multipart o JSON)
- DELETE `/api/vehicles/:id` -> eliminar

### Crear / actualizar con multipart
- Campos: `name` (texto), `photo` (archivo opcional) o `photo` (URL en texto si no se sube archivo)

### Respuestas
JSON con el registro creado/actualizado o mensaje de error.

## Notas de integración frontend
- Al crear con archivo, enviar `Content-Type: multipart/form-data`.
- Al crear con URL: `POST /api/vehicles` con JSON `{ "name": "..", "photo": "https://.." }`.
- Las imágenes subidas quedan disponibles en `/uploads/archivo.jpg`.
