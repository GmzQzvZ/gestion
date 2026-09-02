(function () {
  const groups = document.getElementById('maintenanceGroups');
  const tabs = document.getElementById('categoryTabs');
  const search = document.getElementById('maintenanceSearch');
  const modal = document.getElementById('maintenanceModal');
  const detailModal = document.getElementById('maintenanceDetailModal');
  const detailBody = document.getElementById('maintenanceDetailBody');
  const form = document.getElementById('maintenanceForm');
  const formError = document.getElementById('maintenanceFormError');
  const summary = document.getElementById('maintenanceSummary');
  const categories = ['TODAS', 'PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO', 'DOCUMENTAL', 'LLANTAS', 'LIMPIEZA', 'OTRO'];
  let maintenances = [];
  let selectedCategory = 'TODAS';

  const labels = {
    PREVENTIVO: 'Preventivo', CORRECTIVO: 'Correctivo', PREDICTIVO: 'Predictivo',
    DOCUMENTAL: 'Documental', LLANTAS: 'Llantas', LIMPIEZA: 'Limpieza', OTRO: 'Otro'
  };

  function formatDate(value) {
    if (!value) return 'Sin fecha';
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function formatCost(value) {
    if (value === null || value === undefined || value === '') return 'Sin costo';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }

  function renderTabs() {
    tabs.innerHTML = categories.map(category => `
      <button class="category-tab ${selectedCategory === category ? 'active' : ''}" data-category="${category}">
        ${category === 'TODAS' ? 'Todas' : labels[category]}
      </button>
    `).join('');
    tabs.querySelectorAll('[data-category]').forEach(button => {
      button.addEventListener('click', () => {
        selectedCategory = button.dataset.category;
        renderTabs();
        renderMaintenances();
      });
    });
  }

  function renderMaintenances() {
    const term = search.value.trim().toLowerCase();
    const visible = maintenances.filter(item => {
      const matchesCategory = selectedCategory === 'TODAS' || item.category === selectedCategory;
      const text = [item.name, item.plate, item.maintenance_type, item.provider, item.description].join(' ').toLowerCase();
      return matchesCategory && text.includes(term);
    });
    summary.textContent = `${visible.length} ${visible.length === 1 ? 'registro' : 'registros'}`;

    if (!visible.length) {
      groups.innerHTML = '<div class="empty maintenance-empty">No hay mantenimientos para este filtro.</div>';
      return;
    }

    const grouped = visible.reduce((result, item) => {
      const category = item.category || 'OTRO';
      (result[category] ||= []).push(item);
      return result;
    }, {});
    groups.innerHTML = Object.entries(grouped).map(([category, items]) => `
      <section class="maintenance-category">
        <div class="category-heading"><h2>${labels[category] || category}</h2><span>${items.length}</span></div>
        <div class="maintenance-list">${items.map(createCard).join('')}</div>
      </section>
    `).join('');
    groups.querySelectorAll('[data-delete]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        deleteMaintenance(button.dataset.delete);
      });
    });
    groups.querySelectorAll('[data-detail]').forEach(card => {
      const openDetail = () => openDetailModal(card.dataset.detail);
      card.addEventListener('click', openDetail);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail();
        }
      });
    });
  }

  function createCard(item) {
    const statusClass = item.status === 'REALIZADO' ? 'status-done' : item.status === 'CANCELADO' ? 'status-cancelled' : 'status-planned';
    return `
      <article class="maintenance-card" data-detail="${item.id}" tabindex="0" role="button" aria-label="Ver detalle de ${escapeHtml(item.name)}">
        <div class="maintenance-card-top">
          <div><h3>${escapeHtml(item.name)}</h3><p class="maintenance-type">${escapeHtml(item.maintenance_type)}</p></div>
          <span class="maintenance-status ${statusClass}">${item.status.toLowerCase()}</span>
        </div>
        <div class="maintenance-meta">
          <span><strong>${escapeHtml(item.plate)}</strong></span>
          <span>${formatDate(item.maintenance_date)}</span>
          <span>${item.mileage ? `${Number(item.mileage).toLocaleString('es-CO')} KM` : 'KM no registrado'}</span>
        </div>
        <p class="maintenance-description">${escapeHtml(item.description)}</p>
        <div class="maintenance-footer">
          <span>${item.provider ? escapeHtml(item.provider) : 'Taller no registrado'}${item.cost ? ` · ${formatCost(item.cost)}` : ''}</span>
          ${item.next_date ? `<span>Próximo: ${formatDate(item.next_date)}</span>` : ''}
          <button class="btn xs primary" type="button">Ver detalle</button>
          <button class="btn xs danger" type="button" data-delete="${item.id}">Eliminar</button>
        </div>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  async function loadMaintenances() {
    groups.innerHTML = '<div class="loading">Cargando mantenimientos...</div>';
    try {
      const response = await fetch('/api/maintenances');
      if (!response.ok) throw new Error('No se pudieron cargar los mantenimientos');
      maintenances = await response.json();
      renderMaintenances();
    } catch (error) {
      console.error(error);
      groups.innerHTML = '<div class="error">No se pudieron cargar los mantenimientos.</div>';
    }
  }

  async function deleteMaintenance(id) {
    if (!confirm('¿Eliminar este mantenimiento?')) return;
    const response = await fetch(`/api/maintenances/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('No se pudo eliminar el mantenimiento.');
      return;
    }
    maintenances = maintenances.filter(item => String(item.id) !== String(id));
    renderMaintenances();
  }

  function openModal() {
    form.reset();
    form.elements.maintenance_date.value = new Date().toISOString().slice(0, 10);
    formError.textContent = '';
    modal.classList.add('open');
    form.elements.name.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  function openDetailModal(id) {
    const item = maintenances.find(maintenance => String(maintenance.id) === String(id));
    if (!item) return;
    detailBody.innerHTML = `
      <div class="detail-heading">
        <div><p class="eyebrow">${labels[item.category] || escapeHtml(item.category)}</p><h3>${escapeHtml(item.name)}</h3></div>
        <span class="maintenance-status ${item.status === 'REALIZADO' ? 'status-done' : item.status === 'CANCELADO' ? 'status-cancelled' : 'status-planned'}">${item.status.toLowerCase()}</span>
      </div>
      <div class="detail-grid">
        ${detailItem('Placa', item.plate)}
        ${detailItem('Tipo', item.maintenance_type)}
        ${detailItem('Fecha', formatDate(item.maintenance_date))}
        ${detailItem('Kilometraje', item.mileage ? `${Number(item.mileage).toLocaleString('es-CO')} KM` : 'No registrado')}
        ${detailItem('Costo', formatCost(item.cost))}
        ${detailItem('Proveedor o taller', item.provider || 'No registrado')}
        ${detailItem('Próxima fecha', item.next_date ? formatDate(item.next_date) : 'No programada')}
      </div>
      <div class="detail-text"><strong>Descripción</strong><p>${escapeHtml(item.description)}</p></div>
      <div class="detail-text"><strong>Notas</strong><p>${item.notes ? escapeHtml(item.notes) : 'Sin notas'}</p></div>
      <div class="modal-footer"><button class="btn primary" type="button" data-close-detail>Cerrar</button></div>
    `;
    detailBody.querySelector('[data-close-detail]').addEventListener('click', closeDetailModal);
    detailModal.classList.add('open');
  }

  function detailItem(label, value) {
    return `<div class="detail-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function closeDetailModal() {
    detailModal.classList.remove('open');
  }

  document.getElementById('btnNewMaintenance').addEventListener('click', openModal);
  document.querySelectorAll('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
  document.querySelectorAll('[data-close-detail]').forEach(element => element.addEventListener('click', closeDetailModal));
  search.addEventListener('input', renderMaintenances);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    formError.textContent = '';
    const data = Object.fromEntries(new FormData(form).entries());
    for (const key of ['mileage', 'cost', 'next_date', 'provider', 'notes']) {
      if (!data[key]) delete data[key];
    }
    try {
      const response = await fetch('/api/maintenances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.errors?.[0]?.msg || result.error || 'No se pudo guardar');
      maintenances.unshift(result);
      closeModal();
      renderMaintenances();
    } catch (error) {
      formError.textContent = error.message;
    }
  });

  renderTabs();
  loadMaintenances();
})();
