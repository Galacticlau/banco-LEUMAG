import { registrarDeposito } from './simulador.js';
import { identificarCuenta } from './accesos.js';

/** Cobros ficticios en memoria. En producción, estas reglas se ejecutarán en PostgreSQL. */
export function actividadAbierta(datos) {
  return datos.actividades.find(actividad => actividad.estado === 'abierta');
}

function validarParticipantes(datos, identificadores) {
  if (!Array.isArray(identificadores) || !identificadores.length) throw new Error('Selecciona al menos un estudiante habilitado.');
  const participantes = [...new Set(identificadores)];
  if (participantes.some(id => !datos.estudiantes.some(cuenta => cuenta.id === id))) throw new Error('La selección contiene una cuenta inexistente.');
  return participantes;
}

export function abrirActividad(datos, nombre, monto, identificadores) {
  if (actividadAbierta(datos)) throw new Error('Cierra la actividad actual antes de abrir otra.');
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 100) throw new Error('Escribe un nombre de hasta 100 caracteres.');
  if (!Number.isSafeInteger(monto) || monto < 1 || monto > 100000) throw new Error('El abono debe ser un entero entre 1 y 100.000 LC.');
  const habilitados = validarParticipantes(datos, identificadores);
  const actividad = { id: crypto.randomUUID(), nombre: nombre.trim(), monto, habilitados, estado: 'abierta', cobros: [], abiertaEn: new Date().toISOString(), cerradaEn: null };
  datos.actividades.unshift(actividad);
  return actividad;
}

function buscarAbierta(datos, actividadId) {
  const actividad = datos.actividades.find(actividad => actividad.id === actividadId);
  if (!actividad || actividad.estado !== 'abierta') throw new Error('Esta actividad ya no está abierta. No se realizó ningún abono.');
  return actividad;
}

export function autorizarParticipantes(datos, actividadId, identificadores) {
  const actividad = buscarAbierta(datos, actividadId);
  const participantes = validarParticipantes(datos, identificadores);
  actividad.habilitados = [...new Set([...actividad.habilitados, ...participantes])];
}

/** No hay await entre comprobar duplicados y registrar: una lectura repetida no duplica el abono en esta pestaña. */
export function cobrarActividad(datos, actividadId, referencia) {
  const actividad = buscarAbierta(datos, actividadId);
  const cuenta = identificarCuenta(datos, referencia);
  if (!actividad.habilitados.includes(cuenta.id)) throw new Error('Este estudiante todavía no está habilitado para cobrar esta actividad.');
  if (actividad.cobros.some(cobro => cobro.estudianteId === cuenta.id)) throw new Error('Ya cobró esta actividad. Su saldo no se modificó.');
  const movimiento = registrarDeposito(datos, cuenta.id, actividad.monto, `Actividad: ${actividad.nombre}`);
  movimiento.actividadId = actividad.id;
  actividad.cobros.unshift({ estudianteId: cuenta.id, movimientoId: movimiento.id, fecha: movimiento.fecha });
  return { cuenta, movimiento };
}

export function cerrarActividad(datos, actividadId) {
  const actividad = buscarAbierta(datos, actividadId);
  actividad.estado = 'cerrada';
  actividad.cerradaEn = new Date().toISOString();
  return actividad;
}
