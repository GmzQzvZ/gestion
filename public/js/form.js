
$(function(){
//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

var easingName = $.easing && $.easing.easeInOutBack ? 'easeInOutBack' : 'swing';

$(".next").on('click', function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	
	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			// reset estilos temporales para evitar tamaños reducidos al volver
			current_fs.css({ transform: '', position: '', left: '' });
			next_fs.css({ left: '', opacity: '' });
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: easingName
	});
});

$(".previous").on('click', function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			// reset estilos temporales para evitar tamaños reducidos al volver
			previous_fs.css({ transform: '', opacity: '' });
			current_fs.css({ left: '' });
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: easingName
	});
});

// permitir envío real del formulario
$("#msform").on('submit', async function(e){
	e.preventDefault();
	
	// Validar campos requeridos
	const requiredFields = ['plate', 'inspector_name', 'inspector_position'];
	for (const field of requiredFields) {
		const value = $(`#${field}`).val();
		if (!value || value.trim() === '') {
			alert(`El campo ${field} es obligatorio`);
			// Ir al primer fieldset que contiene el campo
			const fieldElement = document.getElementById(field);
			if (fieldElement) {
				const fieldset = fieldElement.closest('fieldset');
				if (fieldset) {
					// Ocultar todos los fieldsets
					$('fieldset').hide();
					// Mostrar el fieldset del campo requerido
					fieldset.show();
					// Actualizar progress bar
					$("#progressbar li").removeClass("active");
					const index = $("fieldset").index(fieldset);
					$("#progressbar li").eq(index).addClass("active");
				}
			}
			return false;
		}
	}
	
	// Mostrar indicador de carga
	const submitBtn = $('input[type="submit"]');
	const originalText = submitBtn.val();
	submitBtn.val('Guardando...').prop('disabled', true);
	
	try {
		// Crear FormData para enviar archivos y datos
		const formData = new FormData(document.getElementById('msform'));
		
		// Procesar campos "OTRO" para selects
		const companySelect = $('#company_name');
		const serviceSelect = $('#service_point');
		const vehicleSelect = $('#vehicle_type');
		
		if (companySelect.val() === 'OTRO' && $('#company_name_other').val()) {
			formData.set('company_name', $('#company_name_other').val());
		}
		
		if (serviceSelect.val() === 'OTRO' && $('#service_point_other').val()) {
			formData.set('service_point', $('#service_point_other').val());
		}
		
		if (vehicleSelect.val() === 'OTRO' && $('#vehicle_type_other').val()) {
			formData.set('vehicle_type', $('#vehicle_type_other').val());
		}
		
		// Los campos ya tienen los nombres correctos, no necesitan corrección
		
		// Procesar checkboxes de radio buttons
		const radioGroups = [
			'espejos', 'vidrios', 'limpiabrisas', 'llantas_del', 'llantas_tras', 'tanque', 'escape', 'bodegas', 'ruidos', 'pisos', 'manijas',
			'pito', 'luces_bajas', 'luces_altas', 'exploradoras_delanteras', 'luces_direccionales', 'luces_parqueo', 'luces_navegacion', 'luces_freno', 'luz_reversa', 'pito_reversa', 'luces_internas', 'television_tdt', 'radio_parlantes',
			'velocimetro', 'odometro', 'tacometro', 'termometro', 'manometro_aire', 'gasometro', 'control_velocidad',
			'puertas_ascenso', 'gps', 'claraboya', 'cinturones', 'botiquin', 'extintor', 'conos_chaleco', 'equipo_carretera', 'kit_ambiental', 'distintivo_escolar', 'senalizacion', 'rotulado_quimico', 'epps',
			'limpieza_exterior', 'silleria', 'bano', 'caneca_basura', 'palomeras', 'pasillos',
			'soat', 'rtm_ley', 'rtm_preventiva', 'poliza', 'convenio', 'fuec', 'tarjeta_operacion', 'licencia_conductor',
			'aceite_motor', 'agua', 'transmision', 'liquido_frenos', 'liquido_bateria', 'sistema_neumatico'
		];
		
		radioGroups.forEach(groupName => {
			const checked = $(`input[name="${groupName}"]:checked`).val();
			if (checked) {
				formData.set(groupName, checked);
			}
		});
		
		// Procesar preoperational_check
		const preoperationalCheck = $('#preoperational_check').val();
		if (preoperationalCheck) {
			formData.set('preoperational_check', preoperationalCheck === 'TRUE');
		}
		
		const response = await fetch('/api/inspections', {
			method: 'POST',
			body: formData
		});
		
		if (response.ok) {
			const result = await response.json();
			alert('¡Inspección guardada exitosamente!');
			console.log('Inspección guardada:', result);
			
			// Opcional: redirigir a la página principal
			window.location.href = '/';
		} else {
			const error = await response.json();
			console.error('Error guardando inspección:', error);
			alert('Error al guardar la inspección: ' + (error.error || 'Error desconocido'));
		}
	} catch (error) {
		console.error('Error en la solicitud:', error);
		alert('Error de conexión al guardar la inspección');
	} finally {
		// Restaurar botón
		submitBtn.val(originalText).prop('disabled', false);
	}
});
});
