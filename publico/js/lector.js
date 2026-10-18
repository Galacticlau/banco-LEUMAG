/** Contrato común: un lector entrega una referencia, nunca autoriza un pago. */
export async function identificarTarjetaSimulada(referencia) {
  await new Promise(resolver => setTimeout(resolver, 650));
  return { referencia, origen: 'simulador', leidaEn: new Date().toISOString() };
}

// Próximas implementaciones: leerDesdeAndroid() y leerDesdePuenteUsb().
// Ambas devolverán { referencia, origen, leidaEn } al mismo flujo de terminal.
// El backend comprobará cuenta, tarjeta, permisos y saldo de forma independiente.
