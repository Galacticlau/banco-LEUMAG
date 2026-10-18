import { crearDatosDemostracion } from './datos.js';
import { registrarDeposito, registrarCanje } from './simulador.js';
import { identificarTarjetaSimulada } from './lector.js';
import { icono } from './iconos.js';
import { seccionesPorRol, resolverRuta, identificarCuenta, permiteAccion } from './accesos.js';
import { bienvenida, ingresoEstudiante, ingresoDocente } from './vistas-acceso.js';

const datos = crearDatosDemostracion();
const estado = { vista: 'acceso', espacio: 'acceso', rol: null, estudianteId: null, referencia: 'DEMO-0001', filtroCuenta: '', sonido: false, saldoVisible: true, categoria: 'Todas', filtro: '', tipoMovimiento: 'todos', identificada: null, leyendo: false };
const contenedor = document.querySelector('#aplicacion');
const dialogo = document.querySelector('#dialogo');
const numero = valor => new Intl.NumberFormat('es-CL').format(valor);
const moneda = valor => `${numero(valor)} <small>LC</small>`;
const escapar = valor => String(valor).replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
const fecha = valor => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Punta_Arenas' }).format(new Date(valor));
const cuentaActual = () => datos.estudiantes.find(cuenta => cuenta.id === estado.estudianteId);
const ruta = vista => `#${estado.rol}/${vista}`;
let secuenciaLectura = 0;
const opcionesCuentas = (seleccionada = null) => datos.estudiantes.map(cuenta => `<option value="${cuenta.id}" ${cuenta.id === Number(seleccionada) ? 'selected' : ''}>${escapar(cuenta.nombre)} · ${escapar(cuenta.curso)}</option>`).join('');
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

/** La navegación muestra exclusivamente las herramientas del espacio activo. */
function dibujar() {
  const secciones = estado.rol ? seccionesPorRol[estado.rol] : [];
  const titulo = secciones.find(([vista]) => vista === estado.vista)?.[2] || (estado.espacio === 'docente' ? 'Acceso docente' : estado.espacio === 'estudiante' ? 'Acceso estudiante' : 'Bienvenida');
  const nombre = estado.rol === 'docente' ? 'Docente' : cuentaActual()?.nombre;
  const vistas = { inicio: vistaInicio, tienda: vistaTienda, historial: vistaHistorial, terminal: vistaTerminal, administracion: vistaAdministracion, resumen: vistaResumenDocente, catalogo: vistaCatalogo };
  const contenido = estado.vista === 'acceso' ? bienvenida() : estado.vista === 'ingreso' ? (estado.espacio === 'docente' ? ingresoDocente() : ingresoEstudiante(estado.leyendo, estado.referencia, escapar)) : vistas[estado.vista]();
  contenedor.innerHTML = `
    <header class="barra-lateral">
      <a href="${estado.rol ? ruta(secciones[0][0]) : '#acceso'}" class="marca"><span class="isotipo" aria-hidden="true">×</span><span>LEUMAG<span class="marca-bank">BANK / MATH CLUB</span></span></a>
      ${estado.rol ? `<nav aria-label="Navegación ${estado.rol}">${secciones.map(([vista, dibujo, etiqueta]) => `<a href="${ruta(vista)}" class="enlace-nav ${estado.vista === vista ? 'activo' : ''}" ${estado.vista === vista ? 'aria-current="page"' : ''}>${icono(dibujo)}<span>${etiqueta}</span></a>`).join('')}</nav>` : '<span class="firma-nav">Aprender tiene infinitas posibilidades.</span>'}
    </header>
    <div class="zona-principal">
      <div class="barra-superior"><span class="identidad-activa">${nombre ? `<strong>${escapar(nombre)}</strong><span class="separador">/</span>` : ''}${titulo}</span><div class="herramientas"><span class="insignia-demo">DEMO INTERACTIVA</span><button class="boton-icono" data-accion="sonido" aria-label="${estado.sonido ? 'Desactivar' : 'Activar'} sonidos" aria-pressed="${estado.sonido}">${icono('sonido')}<span class="estado-sonido">${estado.sonido ? 'On' : 'Off'}</span></button>${estado.rol ? '<button class="boton salir" data-accion="salir">Salir</button>' : ''}</div></div>
      <main id="contenido" tabindex="-1">${contenido}</main>
      <footer><div class="firma-logo"><img src="/imagenes/logo-profe.png" width="1280" height="1280" alt="Logo Profe Clau"><span>LEUMAG BANK <b>·</b> Tu esfuerzo cuenta.</span></div><span>Datos ficticios · Los cambios se reinician al recargar</span></footer>
    </div>`;
  document.title = `${titulo} · LEUMAG BANK`;
}
function encabezado(etiqueta, titulo, descripcion, accion = '') {
  return `<div class="encabezado"><div><span class="sobrelinea">${etiqueta}</span><h1>${titulo}</h1><p>${descripcion}</p></div>${accion}</div>`;
}
/** Portada editorial con geometría vectorial: decoración, no una gráfica de datos. */
function portadaMatematica() {
  return `
    <section class="portada-matematica" aria-labelledby="titulo-portada">
      <div class="portada-texto">
        <span class="sello-club"><span aria-hidden="true">✳</span> IDEAS GRANDES. LOGROS REALES.</span>
        <h1 id="titulo-portada">Tu esfuerzo<br>se <span>multiplica.</span></h1>
        <p>Pregunta, descubre, conecta.<br>Cada cosa que aprendes abre nuevas posibilidades.</p>
        <a href="${ruta('tienda')}" class="boton boton-explorar">Explorar recompensas ${icono('flecha')}</a>
        <div class="firma-portada"><span aria-hidden="true">↳</span> La próxima gran idea puede ser tuya.</div>
      </div>
      <div class="universo-matematico" aria-hidden="true">
        <div class="etiqueta-formula formula-arriba">∞ posibilidades</div>
        <svg class="escultura" viewBox="0 0 440 330" fill="none">
          <defs>
            <pattern id="cuadricula" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" stroke="#6f54a2" stroke-opacity=".15"/>
            </pattern>
          </defs>
          <rect x="30" y="20" width="380" height="290" rx="28" fill="url(#cuadricula)"/>
          <circle cx="250" cy="175" r="104" stroke="#7460a0" stroke-width="1.5" stroke-dasharray="5 8"/>
          <g class="pieza-triangulo">
            <path d="M97 238 186 73 285 233Z" fill="#d8f269" stroke="#292335" stroke-width="2.5"/>
            <path d="m186 73 28 168 71-8M97 238l117 3" stroke="#292335" stroke-width="2.5"/>
            <path d="m186 73 28 168 71-8Z" fill="#b2ce42" fill-opacity=".6"/>
          </g>
          <g class="pieza-circulo">
            <circle cx="308" cy="125" r="63" fill="#ff9981" stroke="#292335" stroke-width="2.5"/>
            <ellipse cx="308" cy="125" rx="24" ry="63" stroke="#292335" stroke-width="2" transform="rotate(35 308 125)"/>
            <ellipse cx="308" cy="125" rx="63" ry="23" stroke="#292335" stroke-width="2" transform="rotate(35 308 125)"/>
          </g>
          <circle cx="81" cy="88" r="9" fill="#7651d1"/>
          <path d="M350 244v32m-16-16h32" stroke="#7651d1" stroke-width="8"/>
          <path d="m76 285 12-12m-12 0 12 12" stroke="#292335" stroke-width="3"/>
          <path d="M140 39q65-32 114 0" stroke="#7651d1" stroke-width="2"/>
          <path d="m244 29 10 10-14 1" stroke="#7651d1" stroke-width="2"/>
        </svg>
        <div class="etiqueta-formula formula-abajo">(a + b)² = a² + 2ab + b²</div>
        <span class="nota-manuscrita">¡Todo está conectado!</span>
      </div>
    </section>
    <div class="cinta-ideas" aria-label="Aprender, experimentar, compartir y volver a intentar">
      <span>+ APRENDER</span><span>× EXPERIMENTAR</span><span>↗ COMPARTIR</span><span>∞ VOLVER A INTENTAR</span>
    </div>`;
}
function tarjetaMonedero() {
  const cuenta = cuentaActual();
  return `<section class="tarjeta-monedero" aria-label="Tarjeta escolar de demostración"><div class="tarjeta-arriba"><span>MI MONEDERO <b>/ ${String(cuenta.id).padStart(2, '0')}</b></span><span class="estado-tarjeta">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'} <i></i></span></div><div class="saldo-etiqueta">Saldo disponible <button data-accion="saldo" class="boton-icono" aria-label="${estado.saldoVisible ? 'Ocultar' : 'Mostrar'} saldo">${icono('ojo')}</button></div><div class="saldo-grande">${estado.saldoVisible ? moneda(cuenta.saldo) : '••••'}</div><span class="texto-moneda">leumagCoins · moneda escolar</span><div class="tarjeta-abajo"><div><span class="numero-tarjeta">Tu esfuerzo vale.</span><small>${escapar(cuenta.nombre)}</small></div>${icono('nfc', 'nfc-tarjeta')}</div><span class="simbolo-saldo" aria-hidden="true">+</span></section>`;
}
function vistaInicio() {
  const movimientos = datos.movimientos.filter(movimiento => movimiento.estudianteId === estado.estudianteId);
  const ingresos = movimientos.filter(movimiento => movimiento.monto > 0 && !movimiento.id.startsWith('DEMO-INICIAL')).reduce((suma, movimiento) => suma + movimiento.monto, 0);
  const canjes = movimientos.filter(movimiento => movimiento.monto < 0).reduce((suma, movimiento) => suma - movimiento.monto, 0);
  return `${portadaMatematica()}
    <div class="resumen-grid"><div>${tarjetaMonedero()}<div class="acciones-tarjeta"><a href="${ruta('historial')}">${icono('historial')} Ver movimientos</a><button data-accion="mi-tarjeta">${icono('escudo')} Mi tarjeta</button></div></div><div class="resumen-derecha"><div class="estadisticas"><article class="estadistica"><span class="simbolo ingreso">${icono('abajo')}</span><span>Has recibido</span><strong>${moneda(ingresos)}</strong><small>Por actividades en esta demo</small></article><article class="estadistica"><span class="simbolo egreso">${icono('arriba')}</span><span>Has disfrutado</span><strong>${moneda(canjes)}</strong><small>En recompensas de esta demo</small></article></div><div class="mensaje-meta"><span class="simbolo">${icono('destello')}</span><div><strong>Equivocarse también es aprender.</strong><p>Prueba otra estrategia. Haz preguntas. Sigue explorando.</p></div></div></div></div>
    <div class="seccion-titulo"><div><h2>De las ideas a las recompensas<span class="punto-titulo">.</span></h2><p>Explora, elige y celebra lo que has aprendido.</p></div><a href="${ruta('tienda')}" class="enlace-texto">Ver todas ${icono('flecha')}</a></div>
    <div class="premios-grid">${datos.recompensas.slice(0, 3).map(tarjetaPremio).join('')}</div>
    <section class="panel movimientos-inicio"><div class="seccion-titulo"><h2>Últimos movimientos</h2><a href="${ruta('historial')}" class="enlace-texto">Ver historial ${icono('flecha')}</a></div>${listaMovimientos(movimientos.slice(0, 3))}</section>`;
}
function tarjetaPremio(premio) {
  return `<article class="premio"><div class="ilustracion ${premio.color}"><div class="figura-premio">${icono(premio.icono)}</div><span class="categoria-premio">${escapar(premio.categoria)}</span><span class="decoracion">✦</span></div><div class="premio-contenido"><h3>${escapar(premio.nombre)}</h3><p>${escapar(premio.descripcion)}</p><div class="premio-pie"><strong>${moneda(premio.precio)}</strong><button class="boton circular" data-accion="canjear" data-id="${premio.id}" aria-label="Ver recompensa: ${escapar(premio.nombre)}" ${premio.existencias < 1 ? 'disabled' : ''}>${icono('flecha')}</button></div><small>${premio.existencias} disponibles · Catálogo de ejemplo</small></div></article>`;
}
function vistaTienda() {
  return `${encabezado('RECOMPENSAS', 'Dale forma a tu recompensa.', 'Un catálogo de ejemplo para imaginar lo que construiremos juntos.', `<span class="saldo-pastilla">Tu saldo ${moneda(cuentaActual().saldo)}</span>`)}<div class="filtros" aria-label="Categorías">${['Todas', 'Útiles', 'Experiencias', 'Detalles'].map(categoria => `<button class="filtro ${estado.categoria === categoria ? 'seleccionado' : ''}" data-accion="categoria" data-categoria="${categoria}" aria-pressed="${estado.categoria === categoria}">${categoria}</button>`).join('')}</div><div class="premios-grid tienda-grid">${datos.recompensas.filter(premio => estado.categoria === 'Todas' || premio.categoria === estado.categoria).map(tarjetaPremio).join('')}</div><p class="nota">Elige tu recompensa y presenta tu tarjeta a la docente para que apruebe el canje. Aquí puedes consultar; la aprobación se realiza en su terminal.</p>`;
}
function listaMovimientos(movimientos) {
  return movimientos.length ? `<ul class="lista-movimientos">${movimientos.map(movimiento => `<li><span class="simbolo ${movimiento.monto > 0 ? 'ingreso' : 'egreso'}">${icono(movimiento.monto > 0 ? 'abajo' : 'tienda')}</span><div class="detalle-movimiento"><strong>${escapar(movimiento.concepto)}</strong><small>${estado.rol === 'docente' ? escapar(datos.estudiantes.find(cuenta => cuenta.id === movimiento.estudianteId)?.nombre || '') + ' · ' : ''}${movimiento.monto > 0 ? 'Depósito' : 'Canje'} · ${fecha(movimiento.fecha)}</small></div><div class="monto-movimiento ${movimiento.monto > 0 ? 'positivo' : ''}"><strong>${movimiento.monto > 0 ? '+' : '−'}${moneda(Math.abs(movimiento.monto))}</strong><small>Completado · demo</small></div></li>`).join('')}</ul>` : '<div class="vacio">Todavía no hay movimientos de este tipo.</div>';
}
function vistaHistorial() {
  const esDocente = estado.rol === 'docente';
  const movimientos = datos.movimientos.filter(movimiento =>
    (esDocente ? !estado.filtroCuenta || movimiento.estudianteId === Number(estado.filtroCuenta) : movimiento.estudianteId === estado.estudianteId)
    && (estado.tipoMovimiento === 'todos' || movimiento.tipo === estado.tipoMovimiento));
  return `${encabezado('MOVIMIENTOS', esDocente ? 'Cada logro deja una huella.' : 'Tu esfuerzo, paso a paso.', esDocente ? 'Depósitos y canjes de toda la comunidad de demostración.' : 'Los depósitos y canjes de tu propia cuenta.')}
    ${esDocente ? `<label class="campo filtro-cuentas">Cuenta<select id="filtro-historial"><option value="">Todas las cuentas</option>${opcionesCuentas(estado.filtroCuenta)}</select></label>` : ''}
    <div class="filtros">${[['todos','Todos'],['deposito','Depósitos'],['canje','Canjes']].map(([tipo, nombre]) => `<button class="filtro ${estado.tipoMovimiento === tipo ? 'seleccionado' : ''}" data-accion="tipo-movimiento" data-tipo="${tipo}" aria-pressed="${estado.tipoMovimiento === tipo}">${nombre}</button>`).join('')}</div><section class="panel">${listaMovimientos(movimientos)}</section>`;
}
function vistaResumenDocente() {
  const saldoTotal = datos.estudiantes.reduce((suma, cuenta) => suma + cuenta.saldo, 0);
  return `${encabezado('ESPACIO DOCENTE / LEUMAG BANK', 'Tus ideas hacen escuela.', 'Toda tu comunidad, conectada por las ganas de aprender.', '<button class="boton primario" data-accion="depositar">'+icono('mas')+' Reconocer una actividad</button>')}
    <div class="metricas-admin"><article><span>Estudiantes</span><strong>${datos.estudiantes.length}</strong></article><article><span>Moneda en circulación</span><strong>${moneda(saldoTotal)}</strong></article><article><span>Tarjetas bloqueadas</span><strong>${datos.estudiantes.filter(cuenta => cuenta.bloqueada).length}</strong></article></div>
    <div class="atajos-docente">${[['administracion','personas','Cuentas y tarjetas','Consultar cuentas, depositar y bloquear tarjetas.'],['terminal','nfc','Terminal de canjes','Identificar una tarjeta y aprobar una recompensa.'],['catalogo','tienda','Crear posibilidades','Editar premios, precios y existencias.']].map(([vista,dibujo,titulo,descripcion]) => `<a class="panel atajo" href="${ruta(vista)}">${icono(dibujo)}<h2>${titulo}</h2><p>${descripcion}</p><span class="enlace-texto">Abrir ${icono('flecha')}</span></a>`).join('')}</div>
    <section class="panel"><div class="seccion-titulo"><h2>Lo último en la comunidad</h2><a href="${ruta('historial')}" class="enlace-texto">Ver movimientos ${icono('flecha')}</a></div>${listaMovimientos(datos.movimientos.slice(0,5))}</section>`;
}
function vistaCatalogo() {
  return `${encabezado('CATÁLOGO DOCENTE', 'Recompensas con propósito.', 'Edita el catálogo ficticio. Las existencias se actualizan al aprobar canjes.', '<button class="boton primario" data-accion="nuevo-premio">'+icono('mas')+' Nueva recompensa</button>')}
    <div class="premios-grid tienda-grid">${datos.recompensas.map(premio => `<article class="premio"><div class="ilustracion ${premio.color}"><div class="figura-premio">${icono(premio.icono)}</div><span class="categoria-premio">${escapar(premio.categoria)}</span></div><div class="premio-contenido"><h3>${escapar(premio.nombre)}</h3><p>${escapar(premio.descripcion)}</p><div class="premio-pie"><strong>${moneda(premio.precio)}</strong><button class="boton secundario" data-accion="editar-premio" data-id="${premio.id}">Editar</button></div><small>${premio.existencias} disponibles${premio.existencias === 0 ? ' · Agotada' : ''}</small></div></article>`).join('')}</div>`;
}
function vistaAdministracion() {
  return `${encabezado('ADMINISTRACIÓN · DEMOSTRACIÓN', 'Aquí sumamos todos.', 'Gestiona cuentas, reconoce actividades y cuida las tarjetas.', `<button class="boton primario" data-accion="depositar">${icono('mas')} Simular depósito</button>`)}<div class="metricas-admin"><article><span>Cuentas de estudiantes</span><strong>${datos.estudiantes.length}</strong></article><article><span>Tarjetas activas</span><strong>${datos.estudiantes.filter(cuenta => !cuenta.bloqueada).length}</strong></article><article><span>Moneda en circulación</span><strong>${moneda(datos.estudiantes.reduce((suma, cuenta) => suma + cuenta.saldo, 0))}</strong></article></div><section class="panel"><div class="seccion-titulo"><h2>Cuentas escolares</h2><label class="buscador">${icono('buscar')}<input id="buscar-cuenta" type="search" placeholder="Buscar estudiante o curso" aria-label="Buscar estudiante o curso" value="${escapar(estado.filtro)}"></label></div><div class="tabla-contenedor"><table><thead><tr><th>Estudiante</th><th>Curso</th><th>Saldo</th><th>Tarjeta</th><th>Acciones</th></tr></thead><tbody id="filas-cuentas">${filasCuentas()}</tbody></table></div><p class="nota">Herramientas de demostración para docentes. Los cambios son temporales; usa solo información ficticia.</p></section>`;
}
function filasCuentas() {
  const cuentas = datos.estudiantes.filter(cuenta => `${cuenta.nombre} ${cuenta.curso}`.toLocaleLowerCase('es').includes(estado.filtro.toLocaleLowerCase('es')));
  return cuentas.length ? cuentas.map(cuenta => `<tr><td><strong>${escapar(cuenta.nombre)}</strong><small>${cuenta.tarjeta}</small></td><td>${escapar(cuenta.curso)}</td><td class="saldo-tabla">${moneda(cuenta.saldo)}</td><td><span class="etiqueta ${cuenta.bloqueada ? 'bloqueada' : ''}">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'}</span></td><td><div class="acciones-cuenta"><button class="boton texto" data-accion="ver-cuenta" data-id="${cuenta.id}">Ver</button><button class="boton texto" data-accion="depositar" data-id="${cuenta.id}">Depositar</button><button class="boton texto" data-accion="editar-cuenta" data-id="${cuenta.id}">Editar</button><button class="boton texto" data-accion="bloquear" data-id="${cuenta.id}">${cuenta.bloqueada ? 'Desbloquear' : 'Bloquear'}</button></div></td></tr>`).join('') : '<tr><td colspan="5" class="vacio">No se encontraron cuentas.</td></tr>';
}
function vistaTerminal() {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.id === estado.identificada);
  return `${encabezado('TERMINAL · DEMOSTRACIÓN', 'Acerca. Confirma. Disfruta.', 'Así será la experiencia de canje con una tarjeta escolar.')}<div class="terminal-grid"><section class="panel lector-panel"><span class="etiqueta">Lector simulado · sin conexión NFC</span><div class="ondas ${estado.leyendo ? 'leyendo' : ''}">${icono(cuenta ? 'check' : 'nfc')}</div><h2>${estado.leyendo ? 'Identificando…' : cuenta ? 'Tarjeta identificada' : 'Todo listo para comenzar'}</h2><p>${cuenta ? escapar(cuenta.nombre) + ' · ' + cuenta.tarjeta : 'Elige una tarjeta ficticia para probar el recorrido.'}</p><label class="campo">Tarjeta de prueba<select id="tarjeta-terminal" ${estado.leyendo ? 'disabled' : ''}>${opcionesCuentas()}</select></label><button class="boton primario ancho" data-accion="identificar" ${estado.leyendo ? 'disabled' : ''}>${icono('nfc')} ${cuenta ? 'Identificar otra tarjeta' : 'Simular lectura'}</button><small class="nota">Android y lector USB se conectarán en una etapa posterior.</small></section><section class="panel confirmacion-panel"><span class="paso">02 / CONFIRMACIÓN</span><h2>Detalle del canje</h2>${cuenta ? `<div class="cuenta-identificada"><span class="avatar">${String(cuenta.id).padStart(2,'0')}</span><div><strong>${escapar(cuenta.nombre)}</strong><small>${escapar(cuenta.curso)}</small></div><span class="etiqueta ${cuenta.bloqueada ? 'bloqueada' : ''}">${cuenta.bloqueada ? 'Bloqueada' : 'Activa'}</span></div><div class="saldo-terminal"><span>Saldo disponible</span><strong>${moneda(cuenta.saldo)}</strong></div><label class="campo">Recompensa<select id="premio-terminal">${datos.recompensas.map(premio => `<option value="${premio.id}">${escapar(premio.nombre)} · ${numero(premio.precio)} LC</option>`).join('')}</select></label><button class="boton primario ancho" data-accion="terminal-canjear" ${cuenta.bloqueada ? 'disabled' : ''}>Revisar canje ${icono('flecha')}</button>${cuenta.bloqueada ? '<p class="error">Desbloquea esta tarjeta desde Cuentas para probar un canje.</p>' : ''}` : `<div class="espera">${icono('tarjeta')}<p>La cuenta aparecerá aquí<br>después de identificar la tarjeta.</p></div>`}<div class="mensaje-seguridad">${icono('escudo')}<span>Identificar la tarjeta es el primer paso. Cada canje requiere confirmación.</span></div></section></div>`;
}
function abrirDialogo(titulo, contenido) {
  if (dialogo.open) dialogo.close();
  dialogo.innerHTML = `<div class="dialogo-cabecera"><h2 id="titulo-dialogo">${titulo}</h2><button class="boton-icono" data-accion="cerrar-dialogo" aria-label="Cerrar">${icono('cerrar')}</button></div>${contenido}`;
  dialogo.showModal();
}
function dialogoCanje(estudianteId, premioId) {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.id === estudianteId);
  const premio = datos.recompensas.find(premio => premio.id === premioId);
  const problema = cuenta.bloqueada ? 'La tarjeta está bloqueada.' : premio.existencias < 1 ? 'Recompensa agotada.' : cuenta.saldo < premio.precio ? 'No hay saldo suficiente.' : '';
  abrirDialogo('Revisar canje', `<span class="insignia-demo">OPERACIÓN SIMULADA</span><div class="resumen-canje"><p>${escapar(cuenta.nombre)}</p><h3>${escapar(premio.nombre)}</h3><strong>${moneda(premio.precio)}</strong><p>Saldo actual: ${numero(cuenta.saldo)} LC<br>Saldo después del canje: ${problema ? '—' : numero(cuenta.saldo - premio.precio) + ' LC'}</p></div><p class="error" id="error-operacion" role="alert">${problema}</p><button class="boton primario ancho" data-accion="confirmar-canje" data-cuenta="${cuenta.id}" data-id="${premio.id}" ${problema ? 'disabled' : ''}>${icono('check')} Confirmar canje de prueba</button><p class="nota">En la versión final, el servidor validará la autorización antes de descontar.</p>`);
}
async function manejarAccion(evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || boton.disabled) return;
  const accion = boton.dataset.accion;
  if (!permiteAccion(estado.rol, accion)) { avisar('Esta acción corresponde a otro espacio de la demostración.'); return; }
  if (accion === 'salir') { cerrarSesion(); location.hash = '#acceso'; navegar(); return; }
  if (accion === 'entrar-docente') { estado.rol = 'docente'; location.hash = '#docente/resumen'; return; }
  if (accion === 'nuevo-premio' || accion === 'editar-premio') { editarPremio(Number(boton.dataset.id)); return; }
  if (accion === 'editar-cuenta') { editarCuenta(Number(boton.dataset.id)); return; }
  if (accion === 'ver-cuenta') {
    estado.filtroCuenta = boton.dataset.id; estado.tipoMovimiento = 'todos'; location.hash = ruta('historial'); return;
  }
  if (accion === 'cerrar-dialogo') { dialogo.close(); return; }
  if (accion === 'sonido') { estado.sonido = !estado.sonido; sonar(); dibujar(); return; }
  if (accion === 'saldo') { estado.saldoVisible = !estado.saldoVisible; dibujar(); return; }
  if (accion === 'categoria') { estado.categoria = boton.dataset.categoria; dibujar(); return; }
  if (accion === 'tipo-movimiento') { estado.tipoMovimiento = boton.dataset.tipo; dibujar(); return; }
  if (accion === 'mi-tarjeta') {
    abrirDialogo('Mi tarjeta escolar', `<p>Tarjeta <strong>${cuentaActual().tarjeta}</strong></p><p>Estado: <strong>${cuentaActual().bloqueada ? 'bloqueada' : 'activa'}</strong></p><p>Si pierdes tu tarjeta, solicita su bloqueo a la docente. Tu saldo pertenece a tu cuenta.</p><button class="boton primario ancho" data-accion="cerrar-dialogo">Entendido</button>`); return;
  }
  if (accion === 'canjear') {
    const premio = datos.recompensas.find(premio => premio.id === Number(boton.dataset.id));
    abrirDialogo('Tu próxima recompensa', `<div class="resumen-canje"><h3>${escapar(premio.nombre)}</h3><p>${escapar(premio.descripcion)}</p><strong>${moneda(premio.precio)}</strong><p>${cuentaActual().saldo < premio.precio ? 'Te faltan '+numero(premio.precio-cuentaActual().saldo)+' LC. ¡Sigue sumando ideas!' : 'Tienes saldo suficiente. Presenta tu tarjeta a la docente para solicitar el canje.'}</p></div><p class="nota">Consultar este premio no descuenta saldo ni reserva existencias.</p><button class="boton primario ancho" data-accion="cerrar-dialogo">Entendido</button>`); return;
  }
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
    abrirDialogo('Reconocer una actividad', `<p>Depósito de demostración por una actividad realizada.</p><form id="formulario-deposito"><label class="campo">Estudiante<select name="estudiante">${opcionesCuentas(boton.dataset.id)}</select></label><label class="campo">Monto en leumagCoins<input name="monto" type="number" min="1" max="100000" step="1" placeholder="Ej. 300" required></label><label class="campo">Actividad o motivo<input name="motivo" maxlength="120" placeholder="Ej. Trabajo colaborativo" required></label><p class="error" id="error-operacion" role="alert"></p><button class="boton primario ancho" type="submit">Confirmar depósito de prueba</button></form>`); return;
  }
  if (accion === 'bloquear') {
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === Number(boton.dataset.id));
    abrirDialogo(`${cuenta.bloqueada ? 'Desbloquear' : 'Bloquear'} tarjeta`, `<p>${escapar(cuenta.nombre)} · ${cuenta.tarjeta}</p><p>${cuenta.bloqueada ? 'Podrá volver a realizar canjes simulados.' : 'No podrá realizar canjes simulados. Su saldo se conserva.'}</p><button class="boton primario ancho" data-accion="confirmar-bloqueo" data-id="${cuenta.id}">Confirmar cambio de prueba</button>`); return;
  }
  if (accion === 'confirmar-bloqueo') {
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === Number(boton.dataset.id));
    cuenta.bloqueada = !cuenta.bloqueada; dialogo.close(); dibujar(); avisar(`Tarjeta ${cuenta.bloqueada ? 'bloqueada' : 'desbloqueada'} en la demostración.`); return;
  }
  if (accion === 'identificar') {
    const identificador = Number(document.querySelector('#tarjeta-terminal').value);
    const cuenta = datos.estudiantes.find(cuenta => cuenta.id === identificador);
    const secuencia = ++secuenciaLectura;
    estado.leyendo = true; estado.identificada = null; dibujar();
    const lectura = await identificarTarjetaSimulada(cuenta.tarjeta);
    if (secuencia !== secuenciaLectura || estado.rol !== 'docente' || estado.vista !== 'terminal') return;
    estado.identificada = datos.estudiantes.find(cuenta => cuenta.tarjeta === lectura.referencia).id;
    estado.leyendo = false; dibujar(); sonar(); avisar('Tarjeta ficticia identificada.');
  }
}
/** Cerrar la identidad no borra los cambios ficticios de la pestaña. */
function cerrarSesion() {
  secuenciaLectura++;
  Object.assign(estado, { rol: null, estudianteId: null, identificada: null, leyendo: false, saldoVisible: true, filtro: '', filtroCuenta: '', tipoMovimiento: 'todos', categoria: 'Todas' });
  if (dialogo.open) dialogo.close();
}
function editarCuenta(identificador) {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.id === identificador);
  abrirDialogo('Editar cuenta de prueba', `<form id="formulario-cuenta" data-id="${cuenta.id}"><label class="campo">Nombre ficticio<input name="nombre" value="${escapar(cuenta.nombre)}" maxlength="60" required></label><label class="campo">Curso<input name="curso" value="${escapar(cuenta.curso)}" maxlength="40" required></label><p class="nota">Tarjeta ${cuenta.tarjeta}. El saldo se modifica mediante movimientos, para conservar el historial.</p><p class="error" id="error-operacion" role="alert"></p><button class="boton primario ancho" type="submit">Guardar cambios de prueba</button></form>`);
}
function editarPremio(identificador) {
  const premio = datos.recompensas.find(premio => premio.id === identificador) || { nombre: '', descripcion: '', categoria: 'Útiles', precio: 100, existencias: 1 };
  abrirDialogo(identificador ? 'Editar recompensa' : 'Nueva recompensa', `<form id="formulario-premio" data-id="${identificador || ''}"><label class="campo">Nombre<input name="nombre" maxlength="60" required value="${escapar(premio.nombre)}"></label><label class="campo">Descripción<input name="descripcion" maxlength="160" required value="${escapar(premio.descripcion)}"></label><label class="campo">Categoría<select name="categoria">${['Útiles','Experiencias','Detalles'].map(categoria => `<option ${categoria === premio.categoria ? 'selected' : ''}>${categoria}</option>`).join('')}</select></label><div class="formulario-doble"><label class="campo">Precio en LC<input name="precio" type="number" min="1" max="100000" step="1" required value="${premio.precio}"></label><label class="campo">Existencias<input name="existencias" type="number" min="0" max="10000" step="1" required value="${premio.existencias}"></label></div><p class="nota">Con 0 existencias, la recompensa aparece agotada.</p><p class="error" id="error-operacion" role="alert"></p><button class="boton primario ancho" type="submit">Guardar recompensa de prueba</button></form>`);
}
document.addEventListener('click', manejarAccion);
document.addEventListener('input', evento => {
  if (evento.target.id === 'buscar-cuenta' && estado.rol === 'docente') { estado.filtro = evento.target.value; document.querySelector('#filas-cuentas').innerHTML = filasCuentas(); }
});
document.addEventListener('change', evento => {
  if (evento.target.id === 'filtro-historial' && estado.rol === 'docente') { estado.filtroCuenta = evento.target.value; dibujar(); document.querySelector('#filtro-historial').focus(); }
});
document.addEventListener('submit', async evento => {
  const formulario = evento.target;
  if (!['formulario-ingreso','formulario-deposito','formulario-cuenta','formulario-premio'].includes(formulario.id)) return;
  evento.preventDefault();
  const campos = new FormData(formulario);
  if (formulario.id === 'formulario-ingreso') {
    if (estado.rol || estado.leyendo || estado.espacio !== 'estudiante') return;
    const secuencia = ++secuenciaLectura;
    estado.referencia = String(campos.get('tarjeta')).trim().toUpperCase();
    estado.leyendo = true; dibujar();
    try {
      const lectura = await identificarTarjetaSimulada(estado.referencia);
      if (secuencia !== secuenciaLectura || estado.espacio !== 'estudiante') return;
      const cuenta = identificarCuenta(datos, lectura.referencia);
      estado.rol = 'estudiante'; estado.estudianteId = cuenta.id; estado.leyendo = false;
      sonar(); location.hash = '#estudiante/inicio'; avisar(`Bienvenido/a, ${cuenta.nombre}.`);
    } catch (error) {
      if (secuencia !== secuenciaLectura) return;
      estado.leyendo = false; dibujar(); avisar(error.message); document.querySelector('[name="tarjeta"]')?.focus();
    }
    return;
  }
  if (estado.rol !== 'docente') { avisar('Entra al espacio docente para realizar esta acción.'); return; }
  try {
    if (formulario.id === 'formulario-deposito') {
      registrarDeposito(datos, Number(campos.get('estudiante')), Number(campos.get('monto')), campos.get('motivo'));
    } else if (formulario.id === 'formulario-cuenta') {
      const nombre = String(campos.get('nombre')).trim(), curso = String(campos.get('curso')).trim();
      if (!nombre || nombre.length > 60 || !curso || curso.length > 40) throw new Error('Completa un nombre y curso válidos.');
      Object.assign(datos.estudiantes.find(cuenta => cuenta.id === Number(formulario.dataset.id)), { nombre, curso });
    } else {
      const nombre = String(campos.get('nombre')).trim(), descripcion = String(campos.get('descripcion')).trim();
      const precio = Number(campos.get('precio')), existencias = Number(campos.get('existencias')), categoria = campos.get('categoria');
      if (!nombre || nombre.length > 60 || !descripcion || descripcion.length > 160) throw new Error('Completa el nombre y la descripción.');
      if (!Number.isSafeInteger(precio) || precio < 1 || precio > 100000 || !Number.isSafeInteger(existencias) || existencias < 0 || existencias > 10000) throw new Error('Revisa el precio y las existencias. Usa números enteros dentro de los límites.');
      if (!['Útiles','Experiencias','Detalles'].includes(categoria)) throw new Error('Selecciona una categoría válida.');
      const cambios = { nombre, descripcion, precio, existencias, categoria };
      const premio = datos.recompensas.find(premio => premio.id === Number(formulario.dataset.id));
      if (premio) Object.assign(premio, cambios);
      else datos.recompensas.push({ id: Math.max(...datos.recompensas.map(premio => premio.id)) + 1, icono: 'estrella', color: 'lila', ...cambios });
    }
    dialogo.close(); dibujar(); sonar(true); avisar('Cambios registrados en la demostración.');
  } catch (error) { document.querySelector('#error-operacion').textContent = error.message; }
});
function navegar() {
  if (location.hash === '#contenido') { document.querySelector('#contenido')?.focus(); return; }
  const destino = resolverRuta(location.hash, estado.rol);
  if (destino.vista === 'ingreso' || destino.vista === 'acceso') cerrarSesion();
  if (estado.leyendo) { secuenciaLectura++; estado.leyendo = false; }
  Object.assign(estado, destino);
  const direccion = destino.espacio === 'acceso' ? '#acceso' : `#${destino.espacio}/${destino.vista}`;
  if (location.hash !== direccion) history.replaceState(null, '', direccion);
  if (dialogo.open) dialogo.close();
  dibujar(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { navegar(); document.querySelector('#contenido')?.focus(); });
navegar();
