(function(){
  const grid = document.getElementById('vehicleGrid');
  const inspectionGrid = document.getElementById('inspectionGrid');
  const btnAddVehicle = document.getElementById('btnAddVehicle');
  const btnAddInspection = document.getElementById('btnAddInspection');
  const modal = document.getElementById('vehicleModal');
  const form = document.getElementById('vehicleForm');
  const modalTitle = document.getElementById('modalTitle');
  const inputId = document.getElementById('vehicleId');
  const inputName = document.getElementById('vehicleName');
  const inputPhoto = document.getElementById('vehiclePhoto');
  const inputPhotoUrl = document.getElementById('vehiclePhotoUrl');
  const errorName = document.getElementById('errorName');
  const errorPhoto = document.getElementById('errorPhoto');
  const previewImg = document.getElementById('previewImg');
  const searchInput = document.getElementById('searchInput');

  const API_BASE = '';

  const state = {
    vehicles: [],
    inspections: [],
    currentTab: 'vehicles',
    filter: ''
  };

  async function apiListVehicles(){
    const res = await fetch(`${API_BASE}/api/vehicles`);
    if(!res.ok) throw new Error('Error listando vehículos');
    return res.json();
  }
  
  async function apiListInspections(){
    const res = await fetch(`${API_BASE}/api/inspections`);
    if(!res.ok) throw new Error('Error listando inspecciones');
    return res.json();
  }
  
  async function apiDeleteInspection(id){
    const res = await fetch(`${API_BASE}/api/inspections/${id}`, { method: 'DELETE' });
    if(!res.ok) throw new Error('Error eliminando inspección');
  }
  async function apiCreate(data){
    return sendCreateOrUpdate('POST', `${API_BASE}/api/vehicles`, data);
  }
  async function apiUpdate(id, data){
    return sendCreateOrUpdate('PUT', `${API_BASE}/api/vehicles/${id}`, data);
  }
  async function sendCreateOrUpdate(method, url, data){
    if(data.file){
      const fd = new FormData();
      fd.append('name', data.name);
      if(data.file) fd.append('photo', data.file);
      if(data.photoUrl) fd.append('photo', data.photoUrl);
      const res = await fetch(url, { method, body: fd });
      if(!res.ok) throw new Error('Error guardando vehículo');
      return res.json();
    } else {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, photo: data.photoUrl || '' })
      });
      if(!res.ok) throw new Error('Error guardando vehículo');
      return res.json();
    }
  }
  async function apiDelete(id){
    const res = await fetch(`${API_BASE}/api/vehicles/${id}`, { method: 'DELETE' });
    if(!res.ok) throw new Error('Error eliminando');
  }

  async function load(){
    try{
      state.vehicles = await apiListVehicles();
      state.inspections = await apiListInspections();
    }catch(e){
      console.error(e);
      state.vehicles = [];
      state.inspections = [];
    }
    render();
  }

  function uid(){
    return 'tmp_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36);
  }

  function openModal(editVehicle){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    if(editVehicle){
      modalTitle.textContent = 'Editar Vehículo';
      inputId.value = editVehicle.id;
      inputName.value = editVehicle.name;
      inputPhoto.value = '';
      inputPhotoUrl.value = editVehicle.photo || '';
      setPreview(editVehicle.photo || '');
    } else {
      modalTitle.textContent = 'Nuevo Vehículo';
      inputId.value = '';
      form.reset();
      setPreview('');
    }
    setTimeout(()=> inputName.focus(), 50);
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    clearErrors();
  }

  function clearErrors(){
    errorName.textContent = '';
    errorPhoto.textContent = '';
  }

  function setPreview(src){
    if(src){
      previewImg.src = src;
      previewImg.style.display = 'block';
    } else {
      previewImg.removeAttribute('src');
      previewImg.style.display = 'none';
    }
  }

  function validate(){
    clearErrors();
    let valid = true;
    const name = inputName.value.trim();
    if(!name){
      errorName.textContent = 'El nombre es obligatorio';
      valid = false;
    } else if(name.length < 2){
      errorName.textContent = 'El nombre es muy corto';
      valid = false;
    }
    const url = inputPhotoUrl.value.trim();
    if(url && !/^https?:\/\//i.test(url)){
      errorPhoto.textContent = 'Ingrese una URL válida (http/https)';
      valid = false;
    }
    return valid;
  }

  function render(){
    if(state.currentTab === 'vehicles'){
      renderVehicles();
    } else {
      renderInspections();
    }
  }

  function renderVehicles(){
    const tpl = document.getElementById('vehicleCardTpl');
    grid.innerHTML = '';
    const filtered = state.vehicles.filter(v => v.name.toLowerCase().includes(state.filter));
    if(filtered.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No hay vehículos. Agregue uno con "+ Nuevo Vehículo"';
      grid.appendChild(empty);
      return;
    }

    for(const v of filtered){
      const node = tpl.content.cloneNode(true);
      const img = node.querySelector('img.thumb');
      const title = node.querySelector('.title');
      const btnEdit = node.querySelector('[data-edit]');
      const btnDelete = node.querySelector('[data-delete]');

      if(v.photo){
        img.src = v.photo;
        img.alt = `Foto de ${v.name}`;
      } else {
        img.removeAttribute('src');
        img.alt = 'Sin foto';
      }
      title.textContent = v.name;

      btnEdit.addEventListener('click', ()=> openModal(v));
      btnDelete.addEventListener('click', ()=> onDelete(v.id));

      grid.appendChild(node);
    }
  }

  function renderInspections(){
    const tpl = document.getElementById('inspectionCardTpl');
    inspectionGrid.innerHTML = '';
    const filtered = state.inspections.filter(i => 
      i.plate.toLowerCase().includes(state.filter) || 
      i.company_name.toLowerCase().includes(state.filter) ||
      i.driver_name.toLowerCase().includes(state.filter) ||
      i.driver_phone.toLowerCase().includes(state.filter) ||
      i.owner_name.toLowerCase().includes(state.filter) ||
      i.service_point.toLowerCase().includes(state.filter) ||
      i.route.toLowerCase().includes(state.filter) ||
      i.model_year.toString().includes(state.filter) ||
      i.vehicle_type.toLowerCase().includes(state.filter) ||
      i.inspector_name.toLowerCase().includes(state.filter) ||
      i.inspector_position.toLowerCase().includes(state.filter)
    );
    
    if(filtered.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No hay inspecciones. Agregue una con "+ Nueva Inspección"';
      inspectionGrid.appendChild(empty);
      return;
    }

    for(const inspection of filtered){
      const node = tpl.content.cloneNode(true);
      const plate = node.querySelector('.inspection-plate');
      const date = node.querySelector('.inspection-date');
      const companyName = node.querySelector('.company-name');
      const driverName = node.querySelector('.driver-name');
      const driverPhone = node.querySelector('.driver-phone');
      const ownerName = node.querySelector('.owner-name');
      const servicePoint = node.querySelector('.service-point');
      const route = node.querySelector('.route');
      const modelYear = node.querySelector('.model-year');
      const vehicleType = node.querySelector('.vehicle-type');
      const inspectorName = node.querySelector('.inspector-name');
      const inspectorPosition = node.querySelector('.inspector-position');
      const statusIndicator = node.querySelector('.status-indicator');
      const btnView = node.querySelector('[data-view]');
      const btnDelete = node.querySelector('[data-delete]');

      plate.textContent = inspection.plate;
      date.textContent = new Date(inspection.created_at).toLocaleDateString('es-ES');
      companyName.textContent = inspection.company_name || 'N/A';
      driverName.textContent = inspection.driver_name || 'N/A';
      driverPhone.textContent = inspection.driver_phone || 'N/A';
      ownerName.textContent = inspection.owner_name || 'N/A';
      servicePoint.textContent = inspection.service_point || 'N/A';
      route.textContent = inspection.route || 'N/A';
      modelYear.textContent = inspection.model_year || 'N/A';
      vehicleType.textContent = inspection.vehicle_type || 'N/A';
      inspectorName.textContent = inspection.inspector_name;
      inspectorPosition.textContent = inspection.inspector_position || 'N/A';

      // Determinar estado basado en algunas verificaciones críticas
      const criticalChecks = [
        inspection.espejos, inspection.vidrios, inspection.cinturones, 
        inspection.soat, inspection.licencia_conductor
      ];
      const hasFailures = criticalChecks.some(check => check === 'NO_CUMPLE');
      const hasWarnings = criticalChecks.some(check => check === 'NO_APLICA');
      
      if(hasFailures){
        statusIndicator.className = 'status-indicator danger';
      } else if(hasWarnings){
        statusIndicator.className = 'status-indicator warning';
      } else {
        statusIndicator.className = 'status-indicator';
      }

      btnView.addEventListener('click', () => onViewInspection(inspection));
      btnDelete.addEventListener('click', () => onDeleteInspection(inspection.id));

      inspectionGrid.appendChild(node);
    }
  }

  async function onDelete(id){
    const v = state.vehicles.find(x=>x.id==id);
    if(!v) return;
    if(confirm(`¿Eliminar "${v.name}"?`)){
      await apiDelete(id);
      state.vehicles = state.vehicles.filter(x=>x.id!=id);
      render();
    }
  }

  async function onDeleteInspection(id){
    const inspection = state.inspections.find(x=>x.id==id);
    if(!inspection) return;
    if(confirm(`¿Eliminar inspección de "${inspection.plate}"?`)){
      await apiDeleteInspection(id);
      state.inspections = state.inspections.filter(x=>x.id!=id);
      render();
    }
  }

  function onViewInspection(inspection){
    // Redirigir a la vista de detalles de inspección
    window.open(`/inspection-details.html?id=${inspection.id}`, '_blank');
  }

  function switchTab(tabName){
    state.currentTab = tabName;
    
    // Actualizar botones de tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Mostrar/ocultar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    render();
  }

  btnAddInspection.addEventListener('click', ()=> {
    window.open('/form.html', '_blank');
  });

  // Event listeners for tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  modal.addEventListener('click', (e)=>{
    if(e.target.hasAttribute('data-dismiss')){
      closeModal();
    }
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  })

  inputPhoto.addEventListener('change', async ()=>{
    clearErrors();
    if(inputPhoto.files && inputPhoto.files[0]){
      try{
        const file = inputPhoto.files[0];
        const url = URL.createObjectURL(file);
        setPreview(url);
      }catch(err){
        errorPhoto.textContent = 'No se pudo leer la imagen';
      }
    }
  });
  inputPhotoUrl.addEventListener('input', ()=>{
    const url = inputPhotoUrl.value.trim();
    if(/^https?:\/\//i.test(url)) setPreview(url);
    else if(!url) setPreview('');
  });

  searchInput.addEventListener('input', ()=>{
    state.filter = searchInput.value.trim().toLowerCase();
    render();
  })

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!validate()) return;

    try{
      const id = inputId.value;
      const name = inputName.value.trim();
      const file = inputPhoto.files && inputPhoto.files[0] ? inputPhoto.files[0] : null;
      const photoUrl = inputPhotoUrl.value.trim();

      if(id){
        const updated = await apiUpdate(id, { name, file, photoUrl });
        state.vehicles = state.vehicles.map(v => v.id == id ? updated : v);
      } else {
        const created = await apiCreate({ name, file, photoUrl });
        state.vehicles.unshift(created);
      }

      render();
      closeModal();
    }catch(err){
      errorPhoto.textContent = err.message || 'Error al guardar';
    }
  });

  load();
})();
