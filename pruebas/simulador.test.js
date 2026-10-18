import { test as probar } from 'node:test';
import verificar from 'node:assert/strict';
import { crearDatosDemostracion } from '../publico/js/datos.js';
import { registrarDeposito, registrarCanje } from '../publico/js/simulador.js';
import { identificarTarjetaSimulada } from '../publico/js/lector.js';

function verificarConciliacion(datos) {
  for (const cuenta of datos.estudiantes) {
    const suma = datos.movimientos.filter(movimiento => movimiento.estudianteId === cuenta.id).reduce((total, movimiento) => total + movimiento.monto, 0);
    verificar.equal(cuenta.saldo, suma, `La cuenta ${cuenta.id} debe coincidir con su historial`);
  }
}
probar('Las 56 cuentas ficticias tienen referencias únicas e historial conciliado', () => {
  const datos = crearDatosDemostracion();
  verificar.equal(datos.estudiantes.length, 56);
  verificar.equal(new Set(datos.estudiantes.map(cuenta => cuenta.tarjeta)).size, 56);
  verificarConciliacion(datos);
});
probar('Depósito y canje actualizan saldo, inventario e historial de la cuenta correcta', () => {
  const datos = crearDatosDemostracion();
  const saldoInicial = datos.estudiantes[1].saldo;
  registrarDeposito(datos, 2, 300, 'Participación');
  const movimiento = registrarCanje(datos, 2, 3);
  verificar.equal(datos.estudiantes[1].saldo, saldoInicial + 300 - 250);
  verificar.equal(datos.estudiantes[0].saldo, 2450);
  verificar.equal(datos.recompensas[2].existencias, 29);
  verificar.equal(movimiento.saldoPosterior, datos.estudiantes[1].saldo);
  verificarConciliacion(datos);
});
probar('Bloqueo, falta de saldo y falta de inventario no producen modificaciones parciales', () => {
  for (const caso of ['bloqueo', 'saldo', 'inventario']) {
    const datos = crearDatosDemostracion();
    if (caso === 'bloqueo') datos.estudiantes[0].bloqueada = true;
    if (caso === 'saldo') datos.estudiantes[0].saldo = 0;
    if (caso === 'inventario') datos.recompensas[0].existencias = 0;
    const antes = structuredClone(datos);
    verificar.throws(() => registrarCanje(datos, 1, 1));
    verificar.deepEqual(datos, antes);
  }
});
probar('Los depósitos rechazan valores no válidos y motivos vacíos sin alterar datos', () => {
  const datos = crearDatosDemostracion();
  const antes = structuredClone(datos);
  for (const monto of [-1, 0, 1.5, NaN, Infinity, 100001]) {
    verificar.throws(() => registrarDeposito(datos, 1, monto, 'Prueba'));
  }
  verificar.throws(() => registrarDeposito(datos, 1, 100, '  '));
  verificar.throws(() => registrarDeposito(datos, 1, 100, 'a'.repeat(121)));
  verificar.throws(() => registrarDeposito(datos, 999, 100, 'Prueba'));
  verificar.deepEqual(datos, antes);
});
probar('Un canje posterior al agotamiento no duplica la entrega', () => {
  const datos = crearDatosDemostracion();
  datos.recompensas[2].existencias = 1;
  registrarCanje(datos, 1, 3);
  const antes = structuredClone(datos);
  verificar.throws(() => registrarCanje(datos, 1, 3), /agotó/);
  verificar.deepEqual(datos, antes);
});
probar('Cada pestaña o reinicio puede crear una demostración independiente', () => {
  const primera = crearDatosDemostracion();
  const segunda = crearDatosDemostracion();
  registrarDeposito(primera, 1, 100, 'Actividad');
  verificar.equal(segunda.estudiantes[0].saldo, 2450);
});
probar('El adaptador simulado entrega referencia sin autorizar ni incluir saldo', async () => {
  const lectura = await identificarTarjetaSimulada('DEMO-0001');
  verificar.equal(lectura.referencia, 'DEMO-0001');
  verificar.equal(lectura.origen, 'simulador');
  verificar.equal('saldo' in lectura, false);
  verificar.equal('autorizada' in lectura, false);
});
