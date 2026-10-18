/** Separación de la demostración. La autorización real pertenece al futuro servidor. */
export const seccionesPorRol = {
  estudiante: [['inicio', 'cartera', 'Mi cuenta'], ['tienda', 'tienda', 'Recompensas'], ['historial', 'historial', 'Mis movimientos']],
  docente: [['resumen', 'inicio', 'Resumen'], ['administracion', 'personas', 'Cuentas'], ['terminal', 'terminal', 'Terminal'], ['catalogo', 'tienda', 'Catálogo'], ['historial', 'historial', 'Movimientos']],
};

export function resolverRuta(fragmento, rol) {
  const [espacio, vista] = fragmento.replace(/^#/, '').split('/');
  if (!seccionesPorRol[espacio]) return { espacio: 'acceso', vista: 'acceso' };
  if (rol !== espacio || vista === 'ingreso') return { espacio, vista: 'ingreso' };
  const secciones = seccionesPorRol[espacio];
  return { espacio, vista: secciones.some(([nombre]) => nombre === vista) ? vista : secciones[0][0] };
}

export function identificarCuenta(datos, referencia) {
  const cuenta = datos.estudiantes.find(cuenta => cuenta.tarjeta === referencia.trim().toUpperCase());
  if (!cuenta) throw new Error('Tarjeta no reconocida. Revisa el código de prueba.');
  if (cuenta.bloqueada) throw new Error('Esta tarjeta está bloqueada. Pide ayuda a tu docente.');
  return cuenta;
}

const accionesComunes = ['cerrar-dialogo', 'sonido', 'salir'];
const accionesEstudiante = ['saldo', 'categoria', 'tipo-movimiento', 'mi-tarjeta', 'canjear'];
const accionesDocente = ['tipo-movimiento', 'depositar', 'bloquear', 'confirmar-bloqueo', 'identificar', 'terminal-canjear', 'confirmar-canje', 'editar-premio', 'nuevo-premio', 'editar-cuenta', 'ver-cuenta'];

export function permiteAccion(rol, accion) {
  if (accionesComunes.includes(accion)) return true;
  if (!rol) return ['entrar-docente', 'entrar-estudiante'].includes(accion);
  if (!seccionesPorRol[rol]) return false;
  return (rol === 'docente' ? accionesDocente : accionesEstudiante).includes(accion);
}
