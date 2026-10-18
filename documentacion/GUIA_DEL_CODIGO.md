# Cómo funciona el código

## Tres ideas para leerlo

**Datos**: lo que sabemos de cuentas y premios. **Estado de interfaz**: qué pantalla, filtro o tarjeta está seleccionada. **Representación**: el HTML que muestra esa información.

`crearDatosDemostracion()` devuelve un objeto con tres arreglos: `estudiantes`, `recompensas` y `movimientos`. Un arreglo es una lista; cada objeto dentro de él reúne propiedades de un estudiante, premio o movimiento. `Array.from({ length: 56 }, ...)` crea las 56 cuentas sin escribirlas una a una.

```js
const estado = {
  vista: 'acceso',
  rol: null,
  estudianteId: null,
  sonido: false,
  identificada: null,
};
```

`const` impide reemplazar la referencia de una variable. No impide cambiar propiedades del objeto: `estado.vista = 'tienda'` es válido. `null` significa que todavía no hay cuenta identificada.

## Módulos

Cada archivo tiene una responsabilidad. `export` permite compartir una función; `import` permite usarla desde otro archivo. Por ejemplo, `aplicacion.js` importa `registrarCanje` desde `simulador.js`.

`vistas-acceso.js` contiene la bienvenida y las dos entradas. `accesos.js` define las rutas y las acciones de cada espacio. `aplicacion.js` conecta esas piezas con las vistas de cuentas, recompensas y gestión.

## Dos espacios, una fuente de datos de demostración

La URL `#estudiante/ingreso` abre la lectura simulada. `identificarCuenta()` busca la referencia y rechaza tarjetas desconocidas o bloqueadas; después guardamos el `estudianteId` identificado. `cuentaActual()` y los filtros de movimientos usan ese identificador, en vez de fijar siempre Estudiante 01.

El panel `#docente/ingreso` tiene un botón para entrar a una demostración libre. El rol cambia los menús, las rutas y las acciones disponibles. `permiteAccion()` se ejecuta antes de despachar un clic; los formularios docentes también verifican el rol. Esto evita mezclar las experiencias al probar la interfaz, pero **no es autenticación ni protege datos reales**: todos los datos siguen en el navegador.

`cerrarSesion()` limpia la identidad, los filtros y la tarjeta identificada. Un contador de lecturas invalida respuestas pendientes al salir o cambiar de pantalla; una lectura tardía no debe abrir una cuenta después de salir. Recargar la página exige volver a entrar y restaura los datos ficticios.

El catálogo docente permite crear y editar premios. Las cuentas permiten editar nombre y curso. El saldo nunca se edita directamente: se cambia mediante un depósito o un canje con su correspondiente movimiento.

## Recorrido de un canje de prueba

1. El estudiante consulta recompensas con `data-accion="canjear"`: esta acción abre información y no descuenta. La docente identifica la tarjeta en Terminal y usa `data-accion="terminal-canjear"`. Los atributos `data-*` son datos propios asociados a un elemento HTML.
2. Un manejador de clics busca el botón con `closest('[data-accion]')`. Así también funciona cuando el clic cae sobre el SVG dentro del botón.
3. `dialogoCanje()` muestra el premio, el precio y el saldo resultante. El elemento nativo `<dialog>` permite cerrar con Escape y mantiene el foco dentro del diálogo.
4. Al confirmar, `registrarCanje()` busca la cuenta y la recompensa con `find()`. Verifica bloqueo, existencias y saldo.
5. Si una condición falla, `throw new Error(...)` interrumpe el proceso. `try/catch` permite mostrar ese error sin continuar el descuento.
6. Si todo está bien, se actualizan los objetos en memoria y se agrega un movimiento. `unshift()` lo inserta al comienzo del historial.
7. `dibujar()` vuelve a generar las vistas con los datos actualizados y se presenta la confirmación. `sonar(true)` reproduce notas breves si el sonido está activado.

Estas comprobaciones del navegador sirven para **probar la experiencia**, no para asegurar cuentas reales. En etapa 2 el backend será quien valide y modifique PostgreSQL; el navegador esperará su respuesta antes de mostrar éxito.

## Lector desacoplado

```js
const lectura = await identificarTarjetaSimulada(cuenta.tarjeta);
```

`async` indica una función que devuelve una promesa. `await` espera el resultado sin congelar toda la página. Aquí se simula una demora de lectura de 650 ms. Después se recibe:

```js
{ referencia: 'DEMO-0001', origen: 'simulador', leidaEn: '...' }
```

El adaptador Android y el futuro adaptador USB deberán entregar ese mismo formato. No devolverán una orden de pago ni un saldo. La fecha de lectura será solo informativa: el servidor pondrá su propia fecha de operación.

## Diseño y accesibilidad

`estilos.css` contiene la estructura de los componentes. `identidad-matematica.css` define la identidad visual con variables como `--acento`, una portada geométrica SVG y navegación horizontal. La segunda hoja se carga después para aplicar el tema sin mezclarlo con las reglas de negocio. `espacios.css` agrega la bienvenida, los accesos separados y la firma con el logo original. Las consultas `@media` cambian las columnas y la navegación según el ancho. Se incluyen etiquetas de formularios, indicadores de foco, estados deshabilitados, región de avisos y respeto por `prefers-reduced-motion`. El sonido empieza desactivado y el resultado también se informa con texto.

Los iconos son SVG locales. No se descargan fuentes ni imágenes de servicios externos. `escapar()` transforma caracteres especiales antes de insertar texto editable en el HTML, por ejemplo un motivo de depósito escrito por la persona que prueba la demo.

## Servidor y siguientes cambios

`crearServidorWeb()` usa HTTP nativo de Node.js para servir únicamente la carpeta `publico`. La carpeta `documentacion`, las pruebas y las variables de entorno no son recursos públicos. `/salud` responde si el proceso está disponible y declara que todavía no hay base de datos conectada.

Se usa `process.env.PORT` porque Railway asigna un puerto al servicio. Localmente se usa 3000. Las palabras `request`, `response`, `innerHTML`, `addEventListener` o nombres de paquetes y APIs pertenecen a las herramientas: no se traducen. Los nombres definidos por nosotros sí se escriben en español y normalmente sin tildes para facilitar su escritura.
