# NFC y Railway: preparación para las siguientes etapas

## Lo confirmado y lo pendiente

Hardware indicado: Samsung con NFC y NFC Tools, tarjetas MIFARE Classic 1K ISO 14443-3A; lector USB aún sin modelo elegido.

Detectar una tarjeta con NFC Tools no prueba que una página web pueda leer su contenido. [Web NFC de Chrome](https://developer.chrome.com/docs/capabilities/nfc) se limita a mensajes NDEF y no ofrece acceso de bajo nivel a NFC-A o comandos MIFARE. [Android documenta](https://developer.android.com/reference/android/nfc/tech/MifareClassic) que la implementación de MIFARE Classic es opcional según el equipo. No se promete compatibilidad por tener NFC.

### Prueba de compatibilidad cuando lleguemos a esa etapa

1. Anotar modelo exacto de Samsung, versión de Android y navegador.
2. En NFC Tools, leer una tarjeta y revisar las tecnologías detectadas, si aparece NDEF, si es escribible y si solo se está leyendo el UID. No publicar identificadores reales.
3. Con una tarjeta de prueba vacía y respaldando cualquier contenido existente, comprobar lectura y escritura de un registro de prueba si el equipo y la tarjeta lo admiten. No hacer la tarjeta permanentemente de solo lectura durante las pruebas.
4. Si existe NDEF compatible, probar Web NFC en Chrome Android, con HTTPS, permiso explícito e interacción del usuario.
5. Si la web no puede leerla, evaluar un adaptador Android nativo que entregue la referencia a nuestra terminal. NFC Tools no debe tratarse como una API automática de integración.
6. Si el propio hardware no permite la operación requerida, evaluar otro lector o tipo de tarjeta con evidencia de la prueba, antes de comprar materiales.

Una URL NDEF puede abrir la ficha de atención si la combinación lo admite. Abrir esa URL jamás debe causar un depósito o un descuento mediante GET. Debe requerir sesión y confirmación mediante una operación autenticada.

### Lector USB futuro

Elegir el modelo cuando conozcamos sistema operativo y protocolo: un lector que emula teclado tiene una integración distinta de uno PC/SC. Para PC/SC proponemos un puente local que lea el dispositivo y se empareje con una terminal autorizada. Debe limitar orígenes, autenticarse, poder revocarse y no exponer un servicio de lectura abierto en la red. No asumir que WebUSB controla cualquier lector de tarjetas.

Normalizar UID, si se usa, como texto hexadecimal de longitud definida por la tarjeta; no convertirlo a número porque se pueden perder ceros. Enviar solo una referencia opaca a la aplicación. Ni UID ni NDEF serán una contraseña o prueba criptográfica de posesión exclusiva.

## Desplegar esta demostración en Railway

**Estado: configuración preparada, despliegue no realizado desde este entorno.**

1. Revisar la rama `etapa-1-arquitectura-diseno` y confirmar el servicio de destino antes de integrarla a `main`. El servicio llamado `casino-leumag` ya sigue `main` de este repositorio. No reutilizar Postgres como servicio web.
2. En Railway, crear un proyecto y un servicio conectado al repositorio `Galacticlau/banco-LEUMAG`.
3. Usar la raíz del repositorio. Node.js 24 está indicado en `package.json`. No hay dependencias externas que instalar.
4. Comando de inicio: `npm start` (incluido en `railway.json`). El servicio escucha en `0.0.0.0` y en el `PORT` asignado por Railway.
5. Healthcheck: `/salud`. Configurar el dominio del servicio para abrir la web mediante HTTPS.
6. Probar monedero, terminal y administración con las cuentas ficticias. La demo no requiere PostgreSQL.

La configuración de healthcheck sigue la [documentación de Railway](https://docs.railway.com/deployments/healthchecks). La respuesta actual verifica el servidor HTTP, no PostgreSQL.

## Conectar PostgreSQL en etapa 2

Agregar un servicio PostgreSQL en el proyecto, configurar `DATABASE_URL` como referencia al servicio y `SESSION_SECRET` como secreto independiente. Nunca pegar estas variables en archivos versionados. Agregar entonces el controlador SQL, migraciones, credenciales de mínimo privilegio y un mecanismo de creación inicial de la cuenta docente sin contraseña predeterminada.

Verificar políticas de respaldo del servicio, probar restauración y ajustar `/salud` o una ruta de disponibilidad para detectar fallos de la base de datos. Separar los datos de demostración de los datos reales. Hasta implementar y probar autorización del servidor, no cargar la nómina real.
