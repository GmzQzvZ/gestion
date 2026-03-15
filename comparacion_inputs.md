# Comparación: Inputs del Formulario vs Variables del Backend

## Campos del Formulario (Body recibido)
```
[
  'plate', 'Internal Number', 'Company_Name', 'Company Name other', 'Service Point', 
  'Service Point other', 'Route', 'Model', 'vehicle_type_other', 'driver_name', 
  'driver_phone', 'owner_name', 'preoperational_check', 'Vehicle_conditions', 
  'espejos', 'vidrios', 'limpiabrisas', 'llantas_del', 'llantas_tras', 'tanque', 
  'escape', 'bodegas', 'ruidos', 'pisos', 'manijas', 'lighting_conditions', 
  'puertas_ascenso', 'gps', 'claraboya', 'cinturones', 'botiquin', 'extintor', 
  'conos_chaleco', 'equipo_carretera', 'kit_ambiental', 'distintivo_escolar', 
  'senalizacion', 'rotulado_quimico', 'epps', 'safety_observations', 'limpieza_exterior', 
  'silleria', 'bano', 'caneca_basura', 'palomeras', 'pasillos', 'cleaning_observations', 
  'soat', 'rtm_ley', 'rtm_preventiva', 'poliza', 'convenio', 'fuec', 'tarjeta_operacion', 
  'licencia_conductor', 'documentation_observations', 'aceite_motor', 'agua', 
  'transmision', 'liquido_frenos', 'liquido_bateria', 'sistema_neumatico', 
  'leaks_observations', 'inspector_name', 'inspector_position'
]
```

## Variables del Backend (Array values)
```
[
  plate, internal_number, company_name, service_point, route, model_year,
  vehicle_type, driver_name, driver_phone, owner_name, preoperational_check,
  preoperational_file, espejos, vidrios, limpiabrisas, llantas_del, llantas_tras,
  tanque, escape, bodegas, ruidos, pisos, manijas, vehicle_conditions,
  JSON.stringify(vehicle_status_files), pito, luces_bajas, luces_altas, exploradoras_delanteras,
  luces_direccionales, luces_parqueo, luces_navegacion, luces_freno,
  luz_reversa, pito_reversa, luces_internas, television_tdt, radio_parlantes,
  lighting_conditions, JSON.stringify(lighting_files), velocimetro, odometro, tacometro,
  termometro, manometro_aire, gasometro, control_velocidad, dashboard_conditions,
  JSON.stringify(dashboard_files), puertas_ascenso, gps, claraboya, cinturones, botiquin, extintor,
  conos_chaleco, equipo_carretera, kit_ambiental, distintivo_escolar, senalizacion,
  rotulado_quimico, epps, safety_observations, JSON.stringify(safety_files), limpieza_exterior,
  silleria, bano, caneca_basura, palomeras, pasillos, cleaning_observations,
  JSON.stringify(cleaning_files), soat, rtm_ley, rtm_preventiva, poliza, convenio, fuec,
  tarjeta_operacion, licencia_conductor, documentation_observations,
  JSON.stringify(documentation_files), aceite_motor, agua, transmision, liquido_frenos,
  liquido_bateria, sistema_neumatico, leaks_observations, JSON.stringify(leaks_files),
  inspector_name, inspector_position
]
```

## Problemas Identificados

### 1. Nombres diferentes entre formulario y backend
| Input Formulario | Variable Backend | Problema |
|------------------|------------------|----------|
| Internal Number | internal_number | Espacios vs guiones bajos |
| Company_Name | company_name | Guiones vs guiones bajos |
| Company Name other | company_name | Campo "other" no mapeado |
| Service Point | service_point | Espacios vs guiones bajos |
| Service Point other | service_point | Campo "other" no mapeado |
| Route | route | ✅ OK |
| Model | model_year | Nombre diferente |
| vehicle_type_other | vehicle_type | Campo "other" no mapeado |
| Vehicle_conditions | vehicle_conditions | Mayúsculas/minúsculas |
| lighting_conditions | lighting_conditions | ✅ OK |

### 2. Campos faltantes en el formulario
Los siguientes campos están en el backend pero NO en el body del formulario:
- pito
- luces_bajas
- luces_altas
- exploradoras_delanteras
- luces_direccionales
- luces_parqueo
- luces_navegacion
- luces_freno
- luz_reversa
- pito_reversa
- luces_internas
- television_tdt
- radio_parlantes
- velocimetro
- odometro
- tacometro
- termometro
- manometro_aire
- gasometro
- control_velocidad
- dashboard_conditions

### 3. Campos de archivos (manejados separadamente)
- vehicle_status_files → req.files.vehicle_status
- lighting_files → req.files.lighting_status
- dashboard_files → req.files.dashboard_files
- safety_files → req.files.safety_evidence
- cleaning_files → req.files.cleaning_evidence
- documentation_files → req.files.documentation_evidence
- leaks_files → req.files.leaks_evidence
- preoperational_file → req.files.template

## Solución Necesaria
1. Corregir nombres de inputs en el formulario para que coincidan con backend
2. Agregar campos faltantes al formulario (radio buttons para luces, tablero, etc.)
3. Mapear correctamente los campos "other" a las variables principales
