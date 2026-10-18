const trazos = {
  inicio: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  cartera: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l14-3v3M16 12h5v5h-5Z"/>',
  tienda: '<path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10q3 4 6 0 3 4 6 0 3 4 6 0M9 21v-7h6v7"/>',
  historial: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  terminal: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8v5H8zM9 15h.01M15 15h.01M9 18h.01M15 18h.01"/>',
  personas: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15q4 0 4 5"/>',
  flecha: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arriba: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  abajo: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  mas: '<path d="M12 4v16M4 12h16"/>',
  tarjeta: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4"/>',
  escudo: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  nfc: '<path d="M8 8a6 6 0 0 1 0 8M12 5a10 10 0 0 1 0 14M16 2a14 14 0 0 1 0 20M4 11v2"/>',
  sonido: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  cerrar: '<path d="m6 6 12 12M18 6 6 18"/>',
  buscar: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  bloqueo: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3"/>',
  lapiz: '<path d="m4 16-1 5 5-1L21 7l-6-6ZM12 4l6 6M4 16l4 4"/>',
  juego: '<path d="M7 7h10q3 0 4 5l1 5q0 5-5 0H7q-5 5-5 0l1-5q1-5 4-5ZM7 10v6M4 13h6M16 11h.01M19 14h.01"/>',
  estrella: '<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
  destello: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
};
export function icono(nombre, clase = '') {
  return `<svg class="icono ${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos[nombre] || trazos.destello}</svg>`;
}
