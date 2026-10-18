# Estado de esta entrega

- Primera etapa implementada localmente: arquitectura y diseño navegable con datos ficticios.
- 8 pruebas automatizadas aprobadas: servidor HTTP, conciliación de 56 cuentas, depósitos/canjes, bloqueos, saldo insuficiente, inventario agotado, entradas inválidas y contrato del lector simulado.
- Sintaxis de `aplicacion.js` comprobada con Node.js.
- Revisión visual y de interacción en un navegador real pendiente: no estaba disponible el control de navegador requerido en el entorno. Los sonidos y la adaptación móvil están implementados, pero todavía requieren esa revisión.
- PostgreSQL, autenticación, permisos reales y NFC físico pendientes según las etapas definidas.
- Railway configurado en archivos; servicio no creado ni desplegado.
- Acceso de escritura a GitHub habilitado por la docente; entrega preparada para publicarse en la rama `etapa-1-arquitectura-diseno` de `Galacticlau/banco-LEUMAG`.

Railway: el enlace proporcionado corresponde al servicio `Postgres` del proyecto `peaceful-patience`, donde también existe `casino-leumag`. No se ha modificado la configuración de esos servicios. El servicio llamado `casino-leumag` ya seguía `Galacticlau/banco-LEUMAG@main`: el primer README disparó un despliegue automático que falló porque aún no había código. La aplicación completa se publica en una rama separada para que su despliegue espere la confirmación del destino.

El ZIP de la entrega inicial es una copia anterior; para continuar el desarrollo, usar los archivos actuales del repositorio.
