/** Reglas del prototipo; NO son controles de seguridad. El servidor las aplicará en etapa 2. */
export function registrarDeposito(datos, estudianteId, monto, motivo) {
  const estudiante = datos.estudiantes.find(cuenta => cuenta.id === estudianteId);
  if (!estudiante) throw new Error('Selecciona una cuenta.');
  if (!Number.isSafeInteger(monto) || monto <= 0 || monto > 100000) throw new Error('Ingresa un monto entero entre 1 y 100.000 LC.');
  if (!motivo.trim() || motivo.length > 120) throw new Error('Escribe un motivo de hasta 120 caracteres.');
  estudiante.saldo += monto;
  return agregarMovimiento(datos, estudiante, monto, motivo.trim(), 'deposito');
}

export function registrarCanje(datos, estudianteId, recompensaId) {
  const estudiante = datos.estudiantes.find(cuenta => cuenta.id === estudianteId);
  const recompensa = datos.recompensas.find(premio => premio.id === recompensaId);
  if (!estudiante || !recompensa) throw new Error('Selecciona una cuenta y una recompensa.');
  if (estudiante.bloqueada) throw new Error('Tarjeta bloqueada. No se puede autorizar el canje.');
  if (recompensa.existencias <= 0) throw new Error('Esta recompensa se agotó.');
  if (estudiante.saldo < recompensa.precio) throw new Error('Saldo insuficiente para esta recompensa.');
  estudiante.saldo -= recompensa.precio;
  recompensa.existencias -= 1;
  return agregarMovimiento(datos, estudiante, -recompensa.precio, recompensa.nombre, 'canje');
}

function agregarMovimiento(datos, estudiante, monto, concepto, tipo) {
  const movimiento = { id: `DEMO-${crypto.randomUUID()}`, estudianteId: estudiante.id, monto, concepto, tipo, fecha: new Date().toISOString(), saldoPosterior: estudiante.saldo };
  datos.movimientos.unshift(movimiento);
  return movimiento;
}
