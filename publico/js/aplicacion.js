import { crearDatosDemostracion } from './datos.js';
import { registrarDeposito, registrarCanje } from './simulador.js';
import { identificarTarjetaSimulada } from './lector.js';
import { icono } from './iconos.js';

const datos = crearDatosDemostracion();
const estado = { vista: 'inicio', sonido: false, saldoVisible: true, categoria: 'Todas', filtro: '', tipoMovimiento: 'todos', identificada: null, leyendo: false };
const contenedor = document.querySelector('#aplicacion');
const dialogo = document.querySelector('#dialogo');
const numero = valor => new Intl.NumberFormat('es-CL').format(valor);
const moneda = valor => `${numero(valor)} <small>LC</small>`;
const escapar = valor => String(valor).replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
const fecha = valor => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Punta_Arenas' }).format(new Date(valor));
const cuentaActual = () => datos.estudiantes[0];
const opcionesCuentas = () => datos.estudiantes.map(cuenta => `<option value="${cuenta.id}">${cuenta.nombre} · ${cuenta.curso}</option>`).join('');
let contextoAudio;
let temporizadorAviso;

function avisar(mensaje) {
  const aviso = document.querySelector('#avisos');
  aviso.textContent = mensaje; aviso.classList.add('visible');
  clearTimeout(temporizadorAviso); temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), 4500);
}
async function sonar(aprobacion = false) {
  if (!estado.sonido) return;
  try {
    contextoAudio ||= new (window.AudioContext || window.webkitAudioContext)();
    await contextoAudio.resume();
    (aprobacion ? [660, 880, 1100] : [740]).forEach((frecuencia, indice) => {
      const oscilador = contextoAudio.createOscillator();
      const volumen = contextoAudio.createGain();
      const inicio = contextoAudio.currentTime + indice * 0.12;
      oscilador.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.0001, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.06, inicio + 0.01);
      volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.18);
      oscilador.connect(volumen); volumen.connect(contextoAudio.destination);
      oscilador.start(inicio); oscilador.stop(inicio + 0.2);
    });
  } catch { avisar('El navegador no pudo reproducir el sonido.'); }
}

const secciones = [ ['inicio', 'inicio', 'Mi monedero'], ['tienda', 'tienda', 'Recompensas'], ['historial', 'historial', 'Movimientos'], ['terminal', 'terminal', 'Terminal de pagos'], ['administracion', 'personas', 'Administración'] ];
function dibujar() {
  const titulo = secciones.find(seccion => seccion[0] === estado.vista)[2];
  contenedor.innerHTML = `
    <aside class="barra-lateral">
      <a href="#inicio" class="marca"><span class="isotipo">L<span>↗</span></span><span>LEUMAG<span class="marca-bank">BANK</span></span></a>
      <div class="leyenda-nav">TU ESPACIO</div>
      <nav aria-label="Navegación principal">${secciones.map(([vista, dibujo, nombre], indice) => `${indice === 3 ? '<div class="leyenda-nav gestion">GESTIÓN · DEMO</div>' : ''}<a href="#${vista}" class="enlace-nav ${estado.vista === vista ? 'activo' : ''}" ${estado.vista === vista ? 'aria-current="page"' : ''}>${icono(dibujo)}<span>${nombre}</span>${estado.vista === vista ? '<span class="punto"></span>' : ''}</a>`).join('')}</nav>
      <div class="lateral-inferior"><div class="comunidad">${icono('destello')}<strong>Pequeños logros.<br>Grandes posibilidades.</strong><p>Tu esfuerzo cuenta, todos los días.</p></div><div class="usuario"><span class="avatar">E1</span><div><strong>Estudiante 01</strong><small>Cuenta de demostración</small></div></div></div>
    </aside>
    <div class="zona-principal">
      <header class="barra-superior"><span>Mi banco escolar <span class="separador">/</span> <strong>${titulo}</strong></span><div class="herramientas"><span class="insignia-demo">DEMO INTERACTIVA</span><button class="boton-icono" data-accion="sonido" aria-label="${estado.sonido ? 'Desactivar' : 'Activar'} sonidos" aria-pressed="${estado.sonido}">${icono('sonido')}<span class="estado-sonido">${estado.sonido ? 'On' : 'Off'}</span></button><span class="avatar mini">E1</span></div></header>
      <main id="contenido" tabindex="-1">${({ inicio: vistaInicio, tienda: vistaTienda, historial: vistaHistorial, terminal: vistaTerminal, administracion: vistaAdministracion })[estado.vista]()}</main>
      <footer><span>LEUMAG BANK <b>·</b> Tu esfuerzo cuenta.</span><span>Datos ficticios · Los cambios se reinician al recargar</span></footer>
    </div>`;
  document.title = `${titulo} · LEUMAG BANK`;
}
function encabezado(etiqueta, titulo, descripcion, accion = '') {
  return `<div class="encabezado"><div><span class="sobrelinea">${etiqueta}</span><h1>${titulo}</h1><p>${descripcion}</p></div>${accion}</div>`;
}
function tarjetaBancaria() {
  const cuenta = cuentaActual();
  return `<section class="tarjeta-bancaria" aria-label="Tarjeta escolar de demostración"><div class="tarjeta-arriba"><span>LEUMAG <b>BANK</b></span><span class="estado-tarjeta">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'} <i></i></span></div><div class="saldo-etiqueta">Saldo disponible <button data-accion="saldo" class="boton-icono" aria-label="${estado.saldoVisible ? 'Ocultar' : 'Mostrar'} saldo">${icono('ojo')}</button></div><div class="saldo-grande">${estado.saldoVisible ? moneda(cuenta.saldo) : '••••'}</div><span class="texto-moneda">leumagCoins · moneda escolar</span><div class="tarjeta-abajo"><div><span class="numero-tarjeta">•••• &nbsp; •••• &nbsp; 0001</span><small>ESTUDIANTE 01</small></div>${icono('nfc', 'nfc-tarjeta')}</div><div class="orbita orbita-uno"></div><div class="orbita orbita-dos"></div></section>`;
}
function vistaInicio() {
  const movimientos = datos.movimientos.filter(movimiento => movimiento.estudianteId === 1);
  const ingresos = movimientos.filter(movimiento => movimiento.monto > 0 && !movimiento.id.startsWith('DEMO-INICIAL')).reduce((suma, movimiento) => suma + movimiento.monto, 0);
  const canjes = movimientos.filter(movimiento => movimiento.monto < 0).reduce((suma, movimiento) => suma - movimiento.monto, 0);
  return `${encabezado('MI MONEDERO', 'Cada logro suma.', 'Aprende, participa y transforma tu esfuerzo en nuevas experiencias.', `<a href="#tienda" class="boton primario">Explorar recompensas ${icono('flecha')}</a>`)}
    <div class="resumen-grid"><div>${tarjetaBancaria()}<div class="acciones-tarjeta"><a href="#historial">${icono('historial')} Ver movimientos</a><button data-accion="mi-tarjeta">${icono('escudo')} Mi tarjeta</button></div></div><div class="resumen-derecha"><div class="estadisticas"><article class="estadistica"><span class="simbolo ingreso">${icono('abajo')}</span><span>Has recibido</span><strong>${moneda(ingresos)}</strong><small>Por actividades en esta demo</small></article><article class="estadistica"><span class="simbolo egreso">${icono('arriba')}</span><span>Has disfrutado</span><strong>${moneda(canjes)}</strong><small>En recompensas de esta demo</small></article></div><div class="mensaje-meta"><span class="simbolo">${icono('destello')}</span><div><strong>Un esfuerzo que se nota.</strong><p>Cada actividad es una oportunidad para seguir sumando.</p></div></div></div></div>
    <div class="seccion-titulo"><div><h2>Tu próxima recompensa</h2><p>Algo pequeño para celebrar un gran esfuerzo.</p></div><a href="#tienda" class="enlace-texto">Ver todas ${icono('flecha')}</a></div>
    <div class="premios-grid">${datos.recompensas.slice(0, 3).map(tarjetaPremio).join('')}</div>
    <section class="panel movimientos-inicio"><div class="seccion-titulo"><h2>Últimos movimientos</h2><a href="#historial" class="enlace-texto">Ver historial ${icono('flecha')}</a></div>${listaMovimientos(movimientos.slice(0, 3))}</section>`;
}
function tarjetaPremio(premio) {
  return `<article class="premio"><div class="ilustracion ${premio.color}"><div class="figura-premio">${icono(premio.icono)}</div><span class="categoria-premio">${premio.categoria}</span><span class="decoracion">✦</span></div><div class="premio-contenido"><h3>${premio.nombre}</h3><p>${premio.descripcion}</p><div class="premio-pie"><strong>${moneda(premio.precio)}</strong><button class="boton circular" data-accion="canjear" data-id="${premio.id}" aria-label="Simular canje de ${premio.nombre}" ${premio.existencias < 1 ? 'disabled' : ''}>${icono('flecha')}</button></div><small>${premio.existencias} disponibles · Catálogo de ejemplo</small></div></article>`;
}
function vistaTienda() {
  return `${encabezado('RECOMPENSAS', 'Elige tu próximo logro.', 'Un catálogo de ejemplo para imaginar lo que construiremos juntos.', `<span class="saldo-pastilla">Tu saldo ${moneda(cuentaActual().saldo)}</span>`)}<div class="filtros" aria-label="Categorías">${['Todas', 'Útiles', 'Experiencias', 'Detalles'].map(categoria => `<button class="filtro ${estado.categoria === categoria ? 'seleccionado' : ''}" data-accion="categoria" data-categoria="${categoria}" aria-pressed="${estado.categoria === categoria}">${categoria}</button>`).join('')}</div><div class="premios-grid tienda-grid">${datos.recompensas.filter(premio => estado.categoria === 'Todas' || premio.categoria === estado.categoria).map(tarjetaPremio).join('')}</div><p class="nota">En esta etapa puedes simular un canje. Los premios y precios definitivos los decidirás tú.</p>`;
}
function listaMovimientos(movimientos) {
  return movimientos.length ? `<ul class="lista-movimientos">${movimientos.map(movimiento => `<li><span class="simbolo ${movimiento.monto > 0 ? 'ingreso' : 'egreso'}">${icono(movimiento.monto > 0 ? 'abajo' : 'tienda')}</span><div class="detalle-movimiento"><strong>${escapar(movimiento.concepto)}</strong><small>${movimiento.monto > 0 ? 'Depósito' : 'Canje'} · ${fecha(movimiento.fecha)}</small></div><div class="monto-movimiento ${movimiento.monto > 0 ? 'positivo' : ''}"><strong>${movimiento.monto > 0 ? '+' : '−'}${moneda(Math.abs(movimiento.monto))}</strong><small>Completado · demo</small></div></li>`).join('')}</ul>` : '<div class="vacio">Todavía no hay movimientos de este tipo.</div>';
}
function vistaHistorial() {
  const movimientos = datos.movimientos.filter(movimiento => movimiento.estudianteId === 1 && (estado.tipoMovimiento === 'todos' || movimiento.tipo === estado.tipoMovimiento));
  return `${encabezado('MOVIMIENTOS', 'Tu esfuerzo, paso a paso.', 'Consulta los depósitos y canjes de la cuenta de demostración.')}<div class="filtros">${[['todos','Todos'],['deposito','Depósitos'],['canje','Canjes']].map(([tipo, nombre]) => `<button class="filtro ${estado.tipoMovimiento === tipo ? 'seleccionado' : ''}" data-accion="tipo-movimiento" data-tipo="${tipo}" aria-pressed="${estado.tipoMovimiento === tipo}">${nombre}</button>`).join('')}</div><section class="panel">${listaMovimientos(movimientos)}</section>`;
}
function vistaAdministracion() {
  return `${encabezado('ADMINISTRACIÓN · DEMOSTRACIÓN', 'Un banco para toda la clase.', 'Gestiona cuentas, reconoce actividades y cuida las tarjetas.', `<button class="boton primario" data-accion="depositar">${icono('mas')} Simular depósito</button>`)}<div class="metricas-admin"><article><span>Cuentas de estudiantes</span><strong>56</strong></article><article><span>Tarjetas activas</span><strong>${datos.estudiantes.filter(cuenta => !cuenta.bloqueada).length}</strong></article><article><span>Moneda en circulación</span><strong>${moneda(datos.estudiantes.reduce((suma, cuenta) => suma + cuenta.saldo, 0))}</strong></article></div><section class="panel"><div class="seccion-titulo"><h2>Cuentas escolares</h2><label class="buscador">${icono('buscar')}<input id="buscar-cuenta" type="search" placeholder="Buscar estudiante o curso" aria-label="Buscar estudiante o curso" value="${escapar(estado.filtro)}"></label></div><div class="tabla-contenedor"><table><thead><tr><th>Estudiante</th><th>Curso</th><th>Saldo</th><th>Tarjeta</th><th>Acciones</th></tr></thead><tbody id="filas-cuentas">${filasCuentas()}</tbody></table></div><p class="nota">El acceso a esta vista es libre solo en el prototipo. La autenticación y los permisos se implementan en la etapa 2.</p></section>`;
}
function filasCuentas() {
  const cuentas = datos.estudiantes.filter(cuenta => `${cuenta.nombre} ${cuenta.curso}`.toLocaleLowerCase('es').includes(estado.filtro.toLocaleLowerCase('es')));
  return cuentas.length ? cuentas.map(cuenta => `<tr><td><strong>${cuenta.nombre}</strong><small>${cuenta.tarjeta}</small></td><td>${cuenta.curso}</td><td class="saldo-tabla">${moneda(cuenta.saldo)}</td><td><span class="etiqueta ${cuenta.bloqueada ? 'bloqueada' : ''}">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'}</span></td><td><button class="boton texto" data-accion="bloquear" data-id="${cuenta.id}">${cuenta.bloqueada ? 'Desbloquear' : 'Bloquear'}</button></td></tr>`).join('') : '<tr><td colspan="5" class="vacio">No se encontraron cuentas.</td></tr>';
}
function vistaTerminal() {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.id === estado.identificada);
  return `${encabezado('TERMINAL · DEMOSTRACIÓN', 'Acerca. Confirma. Disfruta.', 'Así será la experiencia de canje con una tarjeta escolar.')}<div class="terminal-grid"><section class="panel lector-panel"><span class="etiqueta">Lector simulado · sin conexión NFC</span><div class="ondas ${estado.leyendo ? 'leyendo' : ''}">${icono(cuenta ? 'check' : 'nfc')}</div><h2>${estado.leyendo ? 'Identificando…' : cuenta ? 'Tarjeta identificada' : 'Todo listo para comenzar'}</h2><p>${cuenta ? cuenta.nombre + ' · ' + cuenta.tarjeta : 'Elige una tarjeta ficticia para probar el recorrido.'}</p><label class="campo">Tarjeta de prueba<select id="tarjeta-terminal" ${estado.leyendo ? 'disabled' : ''}>${opcionesCuentas()}</select></label><button class="boton primario ancho" data-accion="identificar" ${estado.leyendo ? 'disabled' : ''}>${icono('nfc')} ${cuenta ? 'Identificar otra tarjeta' : 'Simular lectura'}</button><small class="nota">Android y lector USB se conectarán en una etapa posterior.</small></section><section class="panel confirmacion-panel"><span class="paso">02 / CONFIRMACIÓN</span><h2>Detalle del canje</h2>${cuenta ? `<div class="cuenta-identificada"><span class="avatar">${String(cuenta.id).padStart(2,'0')}</span><div><strong>${cuenta.nombre}</strong><small>${cuenta.curso}</small></div><span class="etiqueta ${cuenta.bloqueada ? 'bloqueada' : ''}">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'}</span></div><div class="saldo-terminal"><span>Saldo disponible</span><strong>${moneda(cuenta.saldo)}</strong></div><label class="campo">Recompensa<select id="premio-terminal">${datos.recompensas.map(premio => `<option value="${premio.id}">${premio.nombre} · ${numero(premio.precio)} LC</option>`).join('')}</select></label><button class="boton primario ancho" data-accion="terminal-canjear" ${cuenta.bloqueada ? 'disabled' : ''}>Revisar canje ${icono('flecha')}</button>${cuenta.bloqueada ? '<p class="error">Desbloquea esta tarjeta desde Administración para probar un canje.</p>' : ''}` : `<div class="espera">${icono('tarjeta')}<p>La cuenta aparecerá aquí<br>después de identificar la tarjeta.</p></div>`}<div class="mensaje-seguridad">${icono('escudo')}<span>Identificar la tarjeta es el primer paso. Cada canje requiere confirmación.</span></div></section></div>`;
}
function abrirDialogo(titulo, contenido) {
  dialogo.innerHTML = `<div class="dialogo-cabecera"><h2 id="titulo-dialogo">${titulo}</h2><button class="boton-icono" data-accion="cerrar-dialogo" aria-label="Cerrar">${icono('cerrar')}</button></div>${contenido}`;
  dialogo.showModal();
}
function dialogoCanje(estudianteId, premioId) {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.id === estudianteId);
  const premio = datos.recompensas.find(premio => premio.id === premioId);
  const problema = cuenta.bloqueada ? 'La tarjeta está bloqueada.' : premio.existencias < 1 ? 'Recompensa agotada.' : cuenta.saldo < premio.precio ? 'No hay saldo suficiente.' : '';
  abrirDialogo('Revisar canje', `<span class="insignia-demo">OPERACIÓN SIMULADA</span><div class="resumen-canje"><p>${cuenta.nombre}</p><h3>${premio.nombre}</h3><strong>${moneda(premio.precio)}</strong><p>Saldo actual: ${numero(cuenta.saldo)} LC<br>Saldo después del canje: ${problema ? '—' : numero(cuenta.saldo - premio.precio) + ' LC'}</p></div><p class="error" id="error-operacion" role="alert">${problema}</p><button class="boton primario ancho" data-accion="confirmar-canje" data-cuenta="${cuenta.id}" data-id="${premio.id}" ${problema ? 'disabled' : ''}>${icono('check')} Confirmar canje de prueba</button><p class="nota">En la versión final, el servidor validará la autorización antes de descontar.</p>`);
}
async function manejarAccion(evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || boton.disabled) return;
  const accion = boton.dataset.accion;
  if (accion === 'cerrar-dialogo') { dialogo.close(); return; }
  if (accion === 'sonido') { estado.sonido = !estado.sonido; sonar(); dibujar(); return; }
  if (accion === 'saldo') { estado.saldoVisible = !estado.saldoVisible; dibujar(); return; }
  if (accion === 'categoria') { estado.categoria = boton.dataset.categoria; dibujar(); return; }
  if (accion === 'tipo-movimiento') { estado.tipoMovimiento = boton.dataset.tipo; dibujar(); return; }
  if (accion === 'mi-tarjeta') {
    abrirDialogo('Mi tarjeta escolar', `<p>Tarjeta <strong>DEMO-0001</strong></p><p>Estado: <strong>${cuentaActual().bloqueada ? 'bloqueada' : 'activa'}</strong></p><p>Si pierdes tu tarjeta, solicita su bloqueo a la docente. Tu saldo pertenece a tu cuenta.</p><button class="boton primario ancho" data-accion="cerrar-dialogo">Entendido</button>`); return;
  }
  if (accion === 'canjear') { dialogoCanje(1, Number(boton.dataset.id)); return; }
  if (accion === 'terminal-canjear') { dialogoCanje(estado.identificada, Number(document.querySelector('#premio-terminal').value)); return; }
  if (accion === 'confirmar-canje') {
    try {
      boton.disabled = true;
      const movimiento = registrarCanje(datos, Number(boton.dataset.cuenta), Number(boton.dataset.id));
      dialogo.close(); dibujar(); sonar(true);
      abrirDialogo('¡Canje aprobado!', `<div class="exito">${icono('check')}</div><p class="centrado">${escapar(movimiento.concepto)}<br><strong>Nuevo saldo: ${moneda(movimiento.saldoPosterior)}</strong></p><p class="nota centrado">Comprobante de demostración<br>${movimiento.id.slice(0, 13).toUpperCase()}</p><button class="boton primario ancho" data-accion="cerrar-dialogo">Listo</button>`);
    } catch (error) { document.querySelector('#error-operacion').textContent = error.message; boton.disabled = false; }
    return;
  }
  if (accion === 'depositar') {
    abrirDialogo('Reconocer una actividad', `<p>Depósito de demostración por una actividad realizada.</p><form id="formulario-deposito"><label class="campo">Estudiante<select name="estudiante">${opcionesCuentas()}</select></label><label class="campo">Monto en leumagCoins<input name="monto" type="number" min="1" max="100000" step="1" placeholder="Ej. 300" required></label><label class="campo">Actividad o motivo<input name="motivo" maxlength="120" placeholder="Ej. Trabajo colaborativo" required></label><p class="error" id="error-operacion" role="alert"></p><button class="boton primario ancho" type="submit">Confirmar depósito de prueba</button></form>`); return;
  }
  if (accion === 'bloquear') {
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === Number(boton.dataset.id));
    abrirDialogo(`${cuenta.bloqueada ? 'Desbloquear' : 'Bloquear'} tarjeta`, `<p>${cuenta.nombre} · ${cuenta.tarjeta}</p><p>${cuenta.bloqueada ? 'Podrá volver a realizar canjes simulados.' : 'No podrá realizar canjes simulados. Su saldo se conserva.'}</p><button class="boton primario ancho" data-accion="confirmar-bloqueo" data-id="${cuenta.id}">Confirmar cambio de prueba</button>`); return;
  }
  if (accion === 'confirmar-bloqueo') {
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === Number(boton.dataset.id));
    cuenta.bloqueada = !cuenta.bloqueada; dialogo.close(); dibujar(); avisar(`Tarjeta ${cuenta.bloqueada ? 'bloqueada' : 'desbloqueada'} en la demostración.`); return;
  }
  if (accion === 'identificar') {
    const identificador = Number(document.querySelector('#tarjeta-terminal').value);
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === identificador);
    estado.leyendo = true; estado.identificada = null; dibujar();
    const lectura = await identificarTarjetaSimulada(cuenta.tarjeta);
    estado.identificada = datos.estudiantes.find(cuenta => cuenta.tarjeta === lectura.referencia).id;
    estado.leyendo = false; dibujar(); sonar(); avisar('Tarjeta ficticia identificada.');
  }
}
document.addEventListener('click', manejarAccion);
document.addEventListener('input', evento => {
  if (evento.target.id === 'buscar-cuenta') { estado.filtro = evento.target.value; document.querySelector('#filas-cuentas').innerHTML = filasCuentas(); }
});
dialogo.addEventListener('submit', evento => {
  if (evento.target.id !== 'formulario-deposito') return;
  evento.preventDefault();
  const campos = new FormData(evento.target);
  try {
    registrarDeposito(datos, Number(campos.get('estudiante')), Number(campos.get('monto')), campos.get('motivo'));
    dialogo.close(); dibujar(); sonar(true); avisar('Depósito simulado registrado.');
  } catch (error) { document.querySelector('#error-operacion').textContent = error.message; }
});
function navegar() {
  const vista = location.hash.slice(1);
  estado.vista = secciones.some(seccion => seccion[0] === vista) ? vista : 'inicio';
  if (dialogo.open) dialogo.close();
  dibujar(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { navegar(); document.querySelector('#contenido').focus(); });
navegar();
