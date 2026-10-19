import { test as probar } from 'node:test';
import verificar from 'node:assert/strict';
import { crearServidorWeb } from '../servidor/servidor.js';

probar('Servidor: recursos públicos, salud explícita y rechazo de rutas privadas o mutaciones', async contexto => {
  const servidor = crearServidorWeb();
  await new Promise(resolver => servidor.listen(0, '127.0.0.1', resolver));
  contexto.after(() => new Promise(resolver => servidor.close(resolver)));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const salud = await fetch(`${base}/salud`);
  verificar.equal(salud.status, 200);
  verificar.deepEqual(await salud.json(), { estado: 'disponible', modo: 'demostracion', baseDatosConectada: false });
  for (const ruta of ['/', '/css/estilos.css', '/js/aplicacion.js', '/js/datos.js', '/js/simulador.js', '/js/iconos.js', '/js/lector.js', '/js/accesos.js', '/js/vistas-acceso.js', '/css/espacios.css', '/js/actividades.js', '/js/vistas-actividades.js', '/css/actividades.css']) {
    const respuesta = await fetch(base + ruta);
    verificar.equal(respuesta.status, 200, ruta);
    verificar.equal(respuesta.headers.get('x-content-type-options'), 'nosniff');
    verificar.ok((await respuesta.text()).length > 50);
  }
  const logo = await fetch(`${base}/imagenes/logo-profe.png`);
  verificar.equal(logo.status, 200);
  verificar.equal(logo.headers.get('content-type'), 'image/png');
  verificar.ok((await logo.arrayBuffer()).byteLength > 1000);
  for (const ruta of ['/.env', '/package.json', '/documentacion/ARQUITECTURA.md', '/%2e%2e%2fpackage.json', '/no-existe.js']) {
    verificar.equal((await fetch(base + ruta)).status, 404, ruta);
  }
  verificar.equal((await fetch(`${base}/api/canjes`, { method: 'POST' })).status, 405);
  const cabecera = await fetch(base, { method: 'HEAD' });
  verificar.equal(cabecera.status, 200);
  verificar.equal(await cabecera.text(), '');
});
