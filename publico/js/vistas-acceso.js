import { icono } from './iconos.js';

export function bienvenida() {
  return `<section class="bienvenida"><div><span class="sello-club">LEUMAG BANK / COMUNIDAD MATEMÁTICA</span>
    <h1>Pequeñas ideas.<br><span>Grandes posibilidades.</span></h1>
    <p>Un espacio para aprender, sumar logros y celebrar cada descubrimiento.</p>
    <div class="formula-bienvenida" aria-hidden="true">curiosidad + esfuerzo = ∞</div></div>
    <div class="sello-profesora"><img src="/imagenes/logo-profe.png" width="1280" height="1280" alt="Logo Profe Clau"><span>Matemática que conecta.</span></div></section>
    <div class="puertas-grid"><a class="puerta puerta-estudiante" href="#estudiante/ingreso"><span class="numero-puerta">01 / ESTUDIANTES</span>${icono('tarjeta')}<h2>Tu tarjeta.<br>Tu mundo de logros.</h2><p>Consulta tu saldo, explora recompensas y sigue tu progreso.</p><span class="boton primario">Entrar con mi tarjeta ${icono('flecha')}</span></a>
    <a class="puerta puerta-docente" href="#docente/ingreso"><span class="numero-puerta">02 / DOCENTE</span>${icono('destello')}<h2>Enseñar también<br>es multiplicar.</h2><p>Reconoce actividades, administra cuentas y aprueba los canjes.</p><span class="boton secundario">Ir al espacio docente ${icono('flecha')}</span></a></div>`;
}

export function ingresoEstudiante(leyendo, referencia, escapar) {
  return `<div class="ingreso-grid"><div class="texto-ingreso"><a class="enlace-texto" href="#acceso">← Volver a la bienvenida</a><span class="sobrelinea">ESPACIO ESTUDIANTE</span><h1>Tu próxima idea<br><span>empieza aquí.</span></h1><p>Acerca tu tarjeta para entrar a tu cuenta y descubrir cuánto has avanzado.</p><div class="pistas-acceso"><span>01 Identifica tu tarjeta</span><span>02 Consulta tus logros</span><span>03 Elige tu recompensa</span></div></div>
    <section class="panel lector-panel"><span class="insignia-demo">LECTURA DE DEMOSTRACIÓN</span><div class="ondas ${leyendo ? 'leyendo' : ''}">${icono('nfc')}</div><h2>${leyendo ? 'Identificando tu tarjeta…' : 'Hola, mente curiosa.'}</h2><p>Prueba con un código ficticio entre DEMO-0001 y DEMO-0056.</p>
    <form id="formulario-ingreso"><label class="campo">Código de tarjeta de prueba<input name="tarjeta" value="${escapar(referencia)}" maxlength="20" autocomplete="off" spellcheck="false" required ${leyendo ? 'disabled' : ''} aria-describedby="ayuda-tarjeta"></label><button class="boton primario ancho" type="submit" ${leyendo ? 'disabled' : ''}>${icono('nfc')} ${leyendo ? 'Un momento…' : 'Simular lectura y entrar'}</button></form>
    <p class="nota" id="ayuda-tarjeta">Todavía no se leen tarjetas físicas. Cada código abre una cuenta ficticia diferente. Las tarjetas 0018 y 0039 comienzan bloqueadas.</p></section></div>`;
}

export function ingresoDocente() {
  return `<div class="ingreso-grid"><div class="texto-ingreso"><a class="enlace-texto" href="#acceso">← Volver a la bienvenida</a><span class="sobrelinea">ESPACIO DOCENTE</span><h1>Donde las ideas<br><span>se multiplican.</span></h1><p>Una vista de toda tu comunidad, con las herramientas para acompañar cada logro.</p><div class="pistas-acceso"><span>+ Depósitos por actividades</span><span>× Gestión de cuentas y recompensas</span><span>✓ Aprobación de canjes</span></div></div>
    <section class="panel acceso-docente"><img src="/imagenes/logo-profe.png" width="1280" height="1280" alt="Logo Profe Clau"><h2>Tu espacio, docente.</h2><p>Explora las herramientas con las 56 cuentas de ejemplo.</p><button class="boton primario ancho" data-accion="entrar-docente">Abrir demostración docente ${icono('flecha')}</button><p class="nota">Acceso libre de demostración. La contraseña y los permisos reales se incorporarán al conectar el servidor. Usa solo datos ficticios.</p></section></div>`;
}
