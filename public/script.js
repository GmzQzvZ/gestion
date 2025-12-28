(function(){
  const grid = document.getElementById('vehicleGrid');
  const btnAdd = document.getElementById('btnAdd');
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
    filter: ''
  };

  async function apiList(){
    const res = await fetch(`${API_BASE}/api/vehicles`);
    if(!res.ok) throw new Error('Error listando vehículos');
    return res.json();
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
      state.vehicles = await apiList();
    }catch(e){
      console.error(e);
      state.vehicles = [];
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

  async function onDelete(id){
    const v = state.vehicles.find(x=>x.id==id);
    if(!v) return;
    if(confirm(`¿Eliminar "${v.name}"?`)){
      await apiDelete(id);
      state.vehicles = state.vehicles.filter(x=>x.id!=id);
      render();
    }
  }

  btnAdd.addEventListener('click', ()=> openModal());
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
