/** Etapa 1: entrega archivos públicos. No administra dinero ni autentica usuarios. */
import { createServer as crearServidor } from 'node:http';
import { readFile as leerArchivo } from 'node:fs/promises';
import { fileURLToPath as rutaDesdeUrl } from 'node:url';
import { resolve as resolverRuta, extname as extension } from 'node:path';

const carpetaPublica = rutaDesdeUrl(new URL('../publico/', import.meta.url));
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

export function crearServidorWeb() {
  return crearServidor(async (solicitud, respuesta) => {
    respuesta.setHeader('X-Content-Type-Options', 'nosniff');
    respuesta.setHeader('Referrer-Policy', 'no-referrer');
    respuesta.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (!['GET', 'HEAD'].includes(solicitud.method)) {
      respuesta.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
    }
    try {
      const direccion = new URL(solicitud.url, 'http://localhost');
      if (direccion.pathname === '/salud') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(solicitud.method === 'HEAD' ? undefined : JSON.stringify({ estado: 'disponible', modo: 'demostracion', baseDatosConectada: false })); return;
      }
      const rutaSolicitada = decodeURIComponent(direccion.pathname);
      const archivo = resolverRuta(carpetaPublica, '.' + (rutaSolicitada === '/' ? '/index.html' : rutaSolicitada));
      if (!archivo.startsWith(carpetaPublica) || !tipos[extension(archivo)]) {
        respuesta.writeHead(404).end('No encontrado'); return;
      }
      const contenido = await leerArchivo(archivo);
      respuesta.writeHead(200, { 'Content-Type': tipos[extension(archivo)], 'Cache-Control': 'no-store' });
      respuesta.end(solicitud.method === 'HEAD' ? undefined : contenido);
    } catch {
      respuesta.writeHead(404).end('No encontrado');
    }
  });
}

if (process.argv[1] && resolverRuta(process.argv[1]) === rutaDesdeUrl(import.meta.url)) {
  const puerto = Number(process.env.PORT || 3000);
  crearServidorWeb().listen(puerto, '0.0.0.0', () => console.log(`LEUMAG BANK · demostración en http://localhost:${puerto}`));
}
