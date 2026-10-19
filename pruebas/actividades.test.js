import { test as probar } from 'node:test';
import verificar from 'node:assert/strict';
import { crearDatosDemostracion } from '../publico/js/datos.js';
import { actividadAbierta, abrirActividad, autorizarParticipantes, cobrarActividad, cerrarActividad } from '../publico/js/actividades.js';

probar('Actividad: cada tarjeta habilitada recibe un abono y el puesto continúa abierto', () => {
  const datos = crearDatosDemostracion();
  const actividad = abrirActividad(datos, 'Terminar la guía', 300, [1, 2, 2]);
  const saldos = datos.estudiantes.slice(0,2).map(cuenta => cuenta.saldo);
  for (const [indice, tarjeta] of ['DEMO-0001', 'DEMO-0002'].entries()) {
    const { movimiento } = cobrarActividad(datos, actividad.id, tarjeta);
    verificar.equal(movimiento.monto, 300);
    verificar.equal(movimiento.actividadId, actividad.id);
    verificar.equal(movimiento.concepto, 'Actividad: Terminar la guía');
    verificar.equal(datos.estudiantes[indice].saldo, saldos[indice] + 300);
  }
  verificar.equal(actividad.cobros.length, 2);
  verificar.equal(actividad.habilitados.length, 2);
  verificar.equal(actividadAbierta(datos).id, actividad.id);
});

probar('Actividad: repetir tarjeta, no estar habilitado o usar tarjeta bloqueada/desconocida no cambia datos', () => {
  const datos = crearDatosDemostracion();
  const actividad = abrirActividad(datos, 'Guía', 300, [1,18]);
  cobrarActividad(datos, actividad.id, 'DEMO-0001');
  for (const [tarjeta, error] of [['DEMO-0001', /Ya cobró/], ['DEMO-0002', /no está habilitado/], ['DEMO-0018', /bloqueada/], ['DESCONOCIDA', /no reconocida/]]) {
    const antes = structuredClone(datos);
    verificar.throws(() => cobrarActividad(datos, actividad.id, tarjeta), error);
    verificar.deepEqual(datos, antes);
  }
});

probar('Actividad: se pueden habilitar estudiantes posteriores conservando los cobros anteriores', () => {
  const datos = crearDatosDemostracion();
  const actividad = abrirActividad(datos, 'Guía', 100, [1]);
  cobrarActividad(datos, actividad.id, 'DEMO-0001');
  autorizarParticipantes(datos, actividad.id, [1,2,2]);
  verificar.deepEqual(actividad.habilitados, [1,2]);
  cobrarActividad(datos, actividad.id, 'DEMO-0002');
  verificar.equal(actividad.cobros.length, 2);
  verificar.throws(() => cobrarActividad(datos, actividad.id, 'DEMO-0001'), /Ya cobró/);
});

probar('Actividad: cerrar impide nuevos cobros; una actividad nueva tiene su propio control de duplicados', () => {
  const datos = crearDatosDemostracion();
  const actividad = abrirActividad(datos, 'Guía', 100, [1,2]);
  cobrarActividad(datos, actividad.id, 'DEMO-0001');
  verificar.throws(() => abrirActividad(datos, 'Otra', 100, [2]), /Cierra la actividad/);
  cerrarActividad(datos, actividad.id);
  const antes = structuredClone(datos);
  verificar.throws(() => cobrarActividad(datos, actividad.id, 'DEMO-0002'), /ya no está abierta/);
  verificar.throws(() => autorizarParticipantes(datos, actividad.id, [3]), /ya no está abierta/);
  verificar.deepEqual(datos, antes);
  const siguiente = abrirActividad(datos, 'Guía', 200, [1]);
  verificar.notEqual(siguiente.id, actividad.id);
  cobrarActividad(datos, siguiente.id, 'DEMO-0001');
  verificar.equal(datos.estudiantes[0].saldo, 2750);
});

probar('Actividad: los parámetros inválidos no crean actividades ni modifican saldos', () => {
  const datos = crearDatosDemostracion();
  for (const argumentos of [['',100,[1]], ['Guía',0,[1]], ['Guía',1.5,[1]], ['Guía',100001,[1]], ['Guía',100,[]], ['Guía',100,[999]]]) {
    const antes = structuredClone(datos);
    verificar.throws(() => abrirActividad(datos, ...argumentos));
    verificar.deepEqual(datos, antes);
  }
});
