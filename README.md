# LEUMAG BANK

**Tu esfuerzo cuenta.** Banco escolar para 56 estudiantes, con monederos de leumagCoins, recompensas y tarjetas físicas NFC.

## Estado: etapa 1 · arquitectura y diseño navegable

Esta versión es un **prototipo con datos ficticios**. Incluye monedero, catálogo de recompensas, historial, terminal y administración de 56 cuentas de ejemplo. Permite simular depósitos, canjes y bloqueos, con confirmación, animación y sonidos opcionales.

Los cambios existen **solo en la memoria de cada pestaña** y se reinician al recargar. No hay autenticación, PostgreSQL conectado ni lectura NFC real. El selector de vistas no representa permisos. No ingresar datos reales de estudiantes en esta versión.

## Ejecutar

Requiere Node.js 24. No necesita instalar paquetes de terceros.

```bash
npm start
```

Abrir http://localhost:3000. Para reinicio automático del servidor: `npm run dev`. Para pruebas: `npm test`.

## Recorrido para revisar el diseño

1. **Mi monedero:** revisar saldo, tarjeta, resumen y últimas operaciones.
2. **Recompensas:** elegir un premio, revisar el descuento y confirmar el canje de prueba.
3. **Movimientos:** filtrar depósitos o canjes de Estudiante 01.
4. **Administración:** buscar entre las 56 cuentas y simular un depósito con motivo.
5. **Terminal de pagos:** identificar una tarjeta ficticia, elegir recompensa y confirmar.
6. Probar Estudiante 18 o 39: sus tarjetas empiezan bloqueadas. Se desbloquean desde Administración.
7. Activar el sonido con el botón superior y repetir una lectura o canje. Recargar para restablecer todo.

Los premios, precios, saldos y cursos son ejemplos editables, no decisiones pedagógicas definitivas. LC significa leumagCoins y no representa dinero real.

## Organización

| Ruta | Responsabilidad |
| --- | --- |
| `publico/index.html` | Documento principal y contenedores accesibles |
| `publico/css/estilos.css` | Identidad visual, estados, adaptación móvil y movimiento reducido |
| `publico/js/aplicacion.js` | Vistas, navegación, formularios, confirmaciones y sonido |
| `publico/js/datos.js` | Crea las 56 cuentas y el catálogo ficticio |
| `publico/js/simulador.js` | Reglas locales del prototipo; se reemplazarán por solicitudes a la API |
| `publico/js/lector.js` | Contrato de lectura y adaptador simulado |
| `publico/js/iconos.js` | Iconos SVG locales, sin servicios externos |
| `servidor/servidor.js` | Servidor Node.js de archivos públicos y endpoint `/salud` |
| `documentacion/ARQUITECTURA.md` | Decisiones, entidades, permisos, API prevista y etapas |
| `documentacion/GUIA_DEL_CODIGO.md` | Explicación del código y recorrido de una operación |
| `documentacion/NFC_Y_RAILWAY.md` | Compatibilidad por verificar y preparación de Railway |
| `pruebas/` | Comprobaciones del simulador y del servidor |

Se usan nombres propios de variables, funciones y archivos en español; las palabras del lenguaje y las APIs conservan sus nombres originales.

## Railway

El repositorio incluye `railway.json`, comando de inicio y `/salud`. Está **preparado para desplegar la demostración**, pero este commit no crea un servicio en Railway. Ver [instrucciones de despliegue](documentacion/NFC_Y_RAILWAY.md).

## Próximas etapas

1. Revisar y ajustar el diseño actual.
2. Implementar autenticación, permisos, PostgreSQL y movimientos atómicos.
3. Incorporar depósitos por actividad, inventario, canjes, entrega de premios y auditoría reales.
4. Validar las tarjetas en el Samsung e integrar el adaptador Android.
5. Elegir el lector USB, agregar su adaptador y realizar un piloto antes de habilitar las 56 cuentas.

La tarjeta identificará una cuenta; **nunca almacenará el saldo ni autorizará por sí sola una operación**.
