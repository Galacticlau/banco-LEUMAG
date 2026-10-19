# Estado de esta entrega

## Etapa 1: arquitectura y diseño

- Código integrado en `main` de `Galacticlau/banco-LEUMAG` mediante PR #1.
- Diecisiete pruebas automatizadas aprobadas; sintaxis JavaScript comprobada.
- Logo original Profe Clau integrado en bienvenida, acceso docente y pie del sitio.
- Accesos separados: consulta de cuenta por tarjeta simulada para estudiantes; resumen, cuentas, depósitos, bloqueos, terminal, catálogo editable e historial global para docentes.
- Puesto de actividades: abono continuo por tarjeta simulada, habilitados ampliables, seguimiento, cierre y rechazo de cobros repetidos.
- Las pruebas cubren identificación, separación de acciones y recorrido de depósito/canje/consulta/salida con un DOM mínimo, además del simulador y HTTP.
- Diseño navegable con 56 cuentas ficticias. Los cambios de la demo se reinician al recargar.
- Revisión visual en navegador y pruebas con NFC físico pendientes.
- Autenticación, permisos reales, tablas y persistencia se implementarán en las siguientes etapas.

## Infraestructura autorizada

Proyecto Railway: `peaceful-patience` (`f822703c-3c35-4f24-8fc5-f48fd20a6e1e`).
Entorno: `production` (`3b2ea688-d305-4419-9051-9ffb5f6f18ec`).

- Servicio anterior `casino-leumag` eliminado con autorización de la docente.
- Nuevo servicio web: `leumag-bank` (`14ab4bcc-92b5-4c7a-af9d-5f73b1293b84`), conectado a este repositorio y su rama `main`.
- Nueva base exclusiva: `leumag_bank`, en `Postgres-3Ers` (`925bb0bc-bdfe-47a7-bad4-8bae01ebf2cf`), con volumen propio.
- PostgreSQL original (`0b4e963d-3d40-485c-9a67-62cd96916285`) conservado. No reutilizar su conexión en LEUMAG BANK.
- Ningún otro proyecto de Railway fue modificado.

La variable `DATABASE_URL` del servicio web debe referenciar `${{Postgres-3Ers.DATABASE_URL}}`. El prototipo todavía no ejecuta consultas ni crea tablas: tener la infraestructura preparada no implica persistencia real.

El ZIP inicial es una copia anterior; usar el repositorio para continuar el desarrollo.
