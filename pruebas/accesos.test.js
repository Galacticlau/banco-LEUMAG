import { test as probar } from 'node:test';
import verificar from 'node:assert/strict';
import { resolverRuta, identificarCuenta, permiteAccion } from '../publico/js/accesos.js';
import { crearDatosDemostracion } from '../publico/js/datos.js';

probar('Una dirección directa no establece una identidad de demostración', () => {
  verificar.deepEqual(resolverRuta('#docente/administracion', null), { espacio: 'docente', vista: 'ingreso' });
  verificar.deepEqual(resolverRuta('#estudiante/inicio', null), { espacio: 'estudiante', vista: 'ingreso' });
  verificar.deepEqual(resolverRuta('#docente/terminal', 'estudiante'), { espacio: 'docente', vista: 'ingreso' });
  verificar.deepEqual(resolverRuta('#estudiante/administracion', 'estudiante'), { espacio: 'estudiante', vista: 'inicio' });
});

probar('Cada tarjeta activa identifica su propia cuenta; bloqueadas y desconocidas se rechazan', () => {
  const datos = crearDatosDemostracion();
  verificar.equal(identificarCuenta(datos, ' demo-0002 ').id, 2);
  verificar.equal(identificarCuenta(datos, 'DEMO-0056').id, 56);
  verificar.throws(() => identificarCuenta(datos, 'DEMO-0018'), /bloqueada/);
  verificar.throws(() => identificarCuenta(datos, 'DEMO-0039'), /bloqueada/);
  verificar.throws(() => identificarCuenta(datos, 'DEMO-9999'), /no reconocida/);
  datos.estudiantes[17].bloqueada = false;
  verificar.equal(identificarCuenta(datos, 'DEMO-0018').id, 18);
});

probar('La interfaz estudiantil no despacha acciones docentes', () => {
  for (const accion of ['depositar','confirmar-canje','confirmar-bloqueo','editar-cuenta','nuevo-premio','editar-premio','identificar']) {
    verificar.equal(permiteAccion('estudiante', accion), false, accion);
    verificar.equal(permiteAccion(null, accion), false, accion);
    verificar.equal(permiteAccion('docente', accion), true, accion);
  }
  verificar.equal(permiteAccion('estudiante', 'canjear'), true); // Consulta, no descuento.
  verificar.equal(permiteAccion('estudiante', 'entrar-docente'), false);
  verificar.equal(permiteAccion(null, 'entrar-docente'), true); // Acceso explícitamente libre en demo.
  verificar.equal(permiteAccion('docente', 'accion-desconocida'), false);
});
