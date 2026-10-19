# LEUMAG BANK

**Tu esfuerzo se multiplica.** Banco escolar para 56 estudiantes, con monederos de leumagCoins, recompensas y tarjetas físicas NFC.

## Estado: etapa 1 · arquitectura y diseño navegable

Esta versión es un **prototipo con datos ficticios**. Incluye monedero, catálogo de recompensas, historial, terminal y administración de 56 cuentas de ejemplo. Permite simular depósitos, canjes y bloqueos, con confirmación, animación y sonidos opcionales.

Los cambios existen **solo en la memoria de cada pestaña** y se reinician al recargar. No hay autenticación, PostgreSQL conectado ni lectura NFC real. Los espacios separados y sus comprobaciones de interfaz no sustituyen la autorización del servidor. No ingresar datos reales de estudiantes en esta versión.

## Ejecutar

Requiere Node.js 24. No necesita instalar paquetes de terceros.

```bash
npm start
```

Abrir http://localhost:3000. Para reinicio automático del servidor: `npm run dev`. Para pruebas: `npm test`.

## Recorrido para revisar el diseño

1. La **bienvenida** ofrece dos accesos e incorpora el logo original Profe Clau.
2. **Estudiantes** (`#estudiante/ingreso`): escribir una tarjeta ficticia, por ejemplo `DEMO-0002`, y simular la lectura. Se muestra la cuenta de ese estudiante: saldo, tarjeta, recompensas e historial propio.
3. Consultar un premio no descuenta saldo ni reserva unidades. La docente aprueba los canjes desde su terminal.
4. **Salir** vuelve a la bienvenida y elimina la identidad de la interfaz. Los cambios ficticios de esa pestaña se conservan hasta recargar.
5. **Docente** (`#docente/ingreso`): entrar mediante el botón explícito de demostración, sin contraseña. Hay resumen, actividades, cuentas, terminal, catálogo e historial global con filtro por cuenta.
6. En **Cuentas**, consultar movimientos, editar nombre/curso ficticios, depositar con motivo y bloquear/desbloquear tarjetas. En **Catálogo**, crear o editar premios, precios y existencias; poner 0 unidades marca el premio como agotado.
7. En **Terminal**, simular una lectura, elegir recompensa, revisar el saldo resultante y confirmar el canje.
8. Las tarjetas `DEMO-0018` y `DEMO-0039` comienzan bloqueadas: no permiten entrar como estudiante ni realizar canjes. Se desbloquean desde Cuentas.
9. Activar el sonido con el botón superior y repetir una lectura o canje. Recargar para restablecer todo.

Los premios, precios, saldos y cursos son ejemplos editables, no decisiones pedagógicas definitivas. LC significa leumagCoins y no representa dinero real.

## Recompensas por actividades

En **Docente → Actividades**, abre por ejemplo «Terminar la guía 4 · 300 LC» y marca los estudiantes habilitados. Los botones de selección permiten elegir todos, un curso o ninguno.

El puesto permanece abierto: escribir una tarjeta ficticia y simular su lectura abona automáticamente el monto autorizado, registra el movimiento y deja el campo listo para la siguiente tarjeta. No hay que confirmar cada estudiante. Una tarjeta repetida, bloqueada, desconocida o no habilitada no produce un abono.

Puedes **habilitar más estudiantes** mientras trabajan. El panel muestra quién cobró, quién está pendiente y cuánto se abonó. **Finalizar actividad** detiene los cobros y conserva los movimientos de la pestaña. Solo hay una actividad abierta a la vez; abrir otra crea un nuevo registro independiente.

Prueba con estudiantes 01 y 02 habilitados, cobra con `DEMO-0001` y luego repite esa tarjeta: el segundo intento no debe modificar el saldo. Los datos siguen siendo temporales y la lectura física NFC aún no está implementada.

## Organización

| Ruta | Responsabilidad |
| --- | --- |
| `publico/index.html` | Documento principal y contenedores accesibles |
| `publico/css/estilos.css` | Estructura y estados de los componentes |
| `publico/css/identidad-matematica.css` | Paleta, portada geométrica, navegación horizontal, adaptación móvil y animaciones |
| `publico/css/espacios.css` | Bienvenida, accesos, firma con logo y herramientas docentes |
| `publico/js/accesos.js` | Resolución de rutas, identificación ficticia y acciones disponibles por rol |
| `publico/js/vistas-acceso.js` | Pantallas de bienvenida e ingreso |
| `publico/imagenes/logo-profe.png` | Logo original proporcionado por la docente, sin modificar |
| `publico/js/aplicacion.js` | Vistas, navegación, formularios, confirmaciones y sonido |
| `publico/js/datos.js` | Crea las 56 cuentas y el catálogo ficticio |
| `publico/js/simulador.js` | Reglas locales del prototipo; se reemplazarán por solicitudes a la API |
| `publico/js/actividades.js` | Reglas de apertura, habilitación, cobro único por actividad y cierre |
| `publico/js/vistas-actividades.js` | Selección de habilitados, puesto continuo y seguimiento |
| `publico/css/actividades.css` | Diseño adaptable del puesto y animación del abono |
| `publico/js/lector.js` | Contrato de lectura y adaptador simulado |
| `publico/js/iconos.js` | Iconos SVG locales, sin servicios externos |
| `servidor/servidor.js` | Servidor Node.js de archivos públicos y endpoint `/salud` |
| `documentacion/ARQUITECTURA.md` | Decisiones, entidades, permisos, API prevista y etapas |
| `documentacion/GUIA_DEL_CODIGO.md` | Explicación del código y recorrido de una operación |
| `documentacion/NFC_Y_RAILWAY.md` | Compatibilidad por verificar y preparación de Railway |
| `pruebas/` | Comprobaciones del simulador y del servidor |

Se usan nombres propios de variables, funciones y archivos en español; las palabras del lenguaje y las APIs conservan sus nombres originales.

## Railway

El repositorio incluye `railway.json`, comando de inicio y `/salud`. La infraestructura de la demostración está configurada en el proyecto autorizado: servicio `leumag-bank` y PostgreSQL exclusivo con base `leumag_bank`. La aplicación aún no usa esa base para persistir datos. Ver [instrucciones de despliegue](documentacion/NFC_Y_RAILWAY.md).

## Próximas etapas

1. Revisar y ajustar el diseño actual.
2. Implementar autenticación, permisos, PostgreSQL y movimientos atómicos.
3. Incorporar depósitos por actividad, inventario, canjes, entrega de premios y auditoría reales.
4. Validar las tarjetas en el Samsung e integrar el adaptador Android.
5. Elegir el lector USB, agregar su adaptador y realizar un piloto antes de habilitar las 56 cuentas.

La tarjeta identificará una cuenta; **nunca almacenará el saldo ni autorizará por sí sola una operación**.
