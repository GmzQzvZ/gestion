(function(){
  const inspectionGrid = document.getElementById('inspectionGrid');
  const searchInput = document.getElementById('searchInput');
  const btnAddInspection = document.getElementById('btnAddInspection');
  const API_BASE = '';

  let inspections = [];
  let filter = '';

  async function loadInspections() {
    if (!inspectionGrid) return;
    inspectionGrid.innerHTML = '<div class="loading">Cargando inspecciones...</div>';
    try {
      const response = await fetch(`${API_BASE}/api/inspections`);
      if (!response.ok) throw new Error('Error listando inspecciones');
      inspections = await response.json();
      renderInspections();
    } catch (error) {
      console.error('Error listando inspecciones:', error);
      inspectionGrid.innerHTML = '<div class="error">No se pudo cargar las inspecciones.</div>';
    }
  }

  function renderInspections() {
    if (!inspectionGrid) return;
    const term = filter.trim().toLowerCase();
    const filtered = inspections.filter(item => matchesFilter(item, term));

    if (filtered.length === 0) {
      inspectionGrid.innerHTML = '<div class="empty">No hay inspecciones. Agregue una con "+ Nueva Inspección"</div>';
      return;
    }

    const cards = filtered.map(createCard).join('');
    inspectionGrid.innerHTML = `<div class="inspection-list">${cards}</div>`;
    attachCardActions();
  }

  function matchesFilter(inspection, term) {
    if (!term) return true;
    const fields = [
      inspection.plate,
      inspection.internal_number,
      inspection.company_name,
      inspection.service_point,
      inspection.route,
      inspection.driver_name,
      inspection.driver_phone,
      inspection.owner_name,
      inspection.vehicle_type,
      inspection.inspector_name,
      inspection.inspector_position,
      inspection.model_year
    ];
    return fields.some(value => {
      if (value === undefined || value === null) return false;
      return value.toString().toLowerCase().includes(term);
    });
  }

  function createCard(inspection) {
    const statusClass = getStatusClass(inspection);
    const dateText = formatDate(inspection.created_at);
    return `
      <div class="inspection-card">
        <div class="inspection-header">
          <div>
            <div class="inspection-plate">${safeText(inspection.plate)}</div>
            <div class="inspection-date">${dateText}</div>
          </div>
          <div class="inspection-status">
            <span class="status-indicator ${statusClass}"></span>
          </div>
        </div>
        <div class="inspection-body">
          <div class="inspection-info">
            ${infoRow('Empresa', inspection.company_name)}
            ${infoRow('Número interno', inspection.internal_number)}
            ${infoRow('Punto de Servicio', inspection.service_point)}
            ${infoRow('Ruta', inspection.route)}
            ${infoRow('Modelo', inspection.model_year)}
            ${infoRow('Tipo Vehículo', inspection.vehicle_type)}
            ${infoRow('Conductor', inspection.driver_name)}
            ${infoRow('Teléfono', inspection.driver_phone)}
            ${infoRow('Inspector', inspection.inspector_name)}
          </div>
        </div>
        <div class="inspection-actions">
          <button class="btn xs primary" data-view="${inspection.id}">Ver detalle</button>
          <button class="btn xs danger" data-delete="${inspection.id}">Eliminar</button>
        </div>
      </div>
    `;
  }

  function infoRow(label, value) {
    return `
      <div class="info-row">
        <span class="label">${label}</span>
        <span>${safeText(value)}</span>
      </div>
    `;
  }

  function safeText(value) {
    if (value === undefined || value === null || value === '') return 'N/A';
    return String(value);
  }

  function formatDate(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function getStatusClass(inspection) {
    const criticalChecks = [
      inspection.espejos,
      inspection.vidrios,
      inspection.cinturones,
      inspection.soat,
      inspection.licencia_conductor
    ];
    if (criticalChecks.some(check => check === 'NO_CUMPLE')) return 'danger';
    if (criticalChecks.some(check => check === 'NO_APLICA')) return 'warning';
    return '';
  }

  function attachCardActions() {
    if (!inspectionGrid) return;

    inspectionGrid.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.view;
        if (id) {
          window.open(`/inspection-details.html?id=${id}`, '_blank');
        }
      });
    });

    inspectionGrid.querySelectorAll('[data-delete]').forEach(button => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.delete);
        if (!id) return;
        handleDeleteInspection(id);
      });
    });
  }

  async function handleDeleteInspection(id) {
    if (!confirm('¿Eliminar esta inspección?')) return;
    try {
      await apiDeleteInspection(id);
      inspections = inspections.filter(item => item.id !== id);
      renderInspections();
    } catch (error) {
      console.error('Error eliminando inspección:', error);
      alert('No se pudo eliminar la inspección.');
    }
  }

  async function apiDeleteInspection(id) {
    const response = await fetch(`${API_BASE}/api/inspections/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error eliminando inspección');
  }

  if (btnAddInspection) {
    btnAddInspection.addEventListener('click', () => {
      window.open('/form.html', '_blank');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', event => {
      filter = event.target.value || '';
      renderInspections();
    });
  }

  loadInspections();
})();
