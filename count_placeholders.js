// Script para contar placeholders en el SQL
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
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const placeholders = sql.match(/\?/g);
console.log(`Número de placeholders (?): ${placeholders ? placeholders.length : 0}`);

const columns = sql.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=,|\)|\s*$)/g);
const columnList = columns.filter(col => col !== 'VALUES' && col !== 'INSERT' && col !== 'INTO' && col !== 'inspections');
console.log(`Número de columnas: ${columnList.length}`);
console.log('Columnas:', columnList);
