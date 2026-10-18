/** Datos completamente ficticios. Al recargar se restablece la demostración. */
export function crearDatosDemostracion() {
  const estudiantes = Array.from({ length: 56 }, (_, indice) => ({
    id: indice + 1,
    nombre: `Estudiante ${String(indice + 1).padStart(2, '0')}`,
    curso: indice < 28 ? '1.º medio' : '2.º medio',
    saldo: indice === 0 ? 2450 : 800 + (indice % 12) * 150,
    tarjeta: `DEMO-${String(indice + 1).padStart(4, '0')}`,
    bloqueada: indice === 17 || indice === 38,
  }));
  const recompensas = [
    { id: 1, nombre: 'Kit de escritorio', categoria: 'Útiles', descripcion: 'Un pequeño impulso para tus grandes ideas.', precio: 650, existencias: 12, icono: 'lapiz', color: 'durazno' },
    { id: 2, nombre: 'Tiempo de juego', categoria: 'Experiencias', descripcion: '15 minutos de juego en el espacio acordado.', precio: 400, existencias: 20, icono: 'juego', color: 'lila' },
    { id: 3, nombre: 'Pack de stickers', categoria: 'Detalles', descripcion: 'Dale tu estilo a cuadernos y proyectos.', precio: 250, existencias: 30, icono: 'estrella', color: 'menta' },
    { id: 4, nombre: 'Taller creativo', categoria: 'Experiencias', descripcion: 'Un cupo para explorar y crear algo nuevo.', precio: 1200, existencias: 6, icono: 'destello', color: 'azul' },
  ];
  const movimientos = [
    { id: 'DEMO-M3', estudianteId: 1, concepto: 'Proyecto de matemática', monto: 500, fecha: '2026-10-16T15:00:00Z', tipo: 'deposito', saldoPosterior: 2450 },
    { id: 'DEMO-M2', estudianteId: 1, concepto: 'Pack de stickers', monto: -250, fecha: '2026-10-15T15:00:00Z', tipo: 'canje', saldoPosterior: 1950 },
    { id: 'DEMO-M1', estudianteId: 1, concepto: 'Trabajo colaborativo', monto: 300, fecha: '2026-10-14T15:00:00Z', tipo: 'deposito', saldoPosterior: 2200 },
    ...estudiantes.map(estudiante => ({ id: `DEMO-INICIAL-${estudiante.id}`, estudianteId: estudiante.id, concepto: 'Saldo inicial de demostración', monto: estudiante.id === 1 ? 1900 : estudiante.saldo, fecha: '2026-10-13T15:00:00Z', tipo: 'deposito', saldoPosterior: estudiante.id === 1 ? 1900 : estudiante.saldo })),
  ];
  return { estudiantes, recompensas, movimientos };
}
