# Cómo funciona el código

## Tres ideas para leerlo

**Datos**: lo que sabemos de cuentas y premios. **Estado de interfaz**: qué pantalla, filtro o tarjeta está seleccionada. **Representación**: el HTML que muestra esa información.

`crearDatosDemostracion()` devuelve un objeto con tres arreglos: `estudiantes`, `recompensas` y `movimientos`. Un arreglo es una lista; cada objeto dentro de él reúne propiedades de un estudiante, premio o movimiento. `Array.from({ length: 56 }, ...)` crea las 56 cuentas sin escribirlas una a una.

```js
const estado = {
  vista: 'inicio',
  sonido: false,
  identificada: null,
};
```

`const` impide reemplazar la referencia de una variable. No impide cambiar propiedades del objeto: `estado.vista = 'tienda'` es válido. `null` significa que todavía no hay cuenta identificada.

## Módulos

Cada archivo tiene una responsabilidad. `export` permite compartir una función; `import` permite usarla desde otro archivo. Por ejemplo, `aplicacion.js` importa `registrarCanje` desde `simulador.js`.

`aplicacion.js` conserva las vistas juntas porque aún es un prototipo pequeño. Cuando conectemos la API, extraeremos las vistas a módulos si eso mejora su lectura.

## Recorrido de un canje de prueba

1. La tarjeta de recompensa incluye `data-accion="canjear"` y `data-id` con su identificador. Los atributos `data-*` son datos propios asociados a un elemento HTML.
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

`estilos.css` contiene la estructura de los componentes. `identidad-matematica.css` define la identidad visual con variables como `--acento`, una portada geométrica SVG y navegación horizontal. La segunda hoja se carga después para aplicar el tema sin mezclarlo con las reglas de negocio. Las consultas `@media` cambian las columnas y la navegación según el ancho. Se incluyen etiquetas de formularios, indicadores de foco, estados deshabilitados, región de avisos y respeto por `prefers-reduced-motion`. El sonido empieza desactivado y el resultado también se informa con texto.

Los iconos son SVG locales. No se descargan fuentes ni imágenes de servicios externos. `escapar()` transforma caracteres especiales antes de insertar texto editable en el HTML, por ejemplo un motivo de depósito escrito por la persona que prueba la demo.

## Servidor y siguientes cambios

`crearServidorWeb()` usa HTTP nativo de Node.js para servir únicamente la carpeta `publico`. La carpeta `documentacion`, las pruebas y las variables de entorno no son recursos públicos. `/salud` responde si el proceso está disponible y declara que todavía no hay base de datos conectada.

Se usa `process.env.PORT` porque Railway asigna un puerto al servicio. Localmente se usa 3000. Las palabras `request`, `response`, `innerHTML`, `addEventListener` o nombres de paquetes y APIs pertenecen a las herramientas: no se traducen. Los nombres definidos por nosotros sí se escriben en español y normalmente sin tildes para facilitar su escritura.
