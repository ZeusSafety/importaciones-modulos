/** Dispara la descarga de una URL que responde con `Content-Disposition: attachment`. */
export function descargarArchivo(url: string) {
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.rel = "noopener";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
}

/** Descarga una URL esperando a que llegue completa, para poder mostrar el progreso mientras tanto. */
export async function descargarUrl(url: string, nombreArchivo: string) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`No se pudo descargar ${nombreArchivo} (HTTP ${respuesta.status}).`);
  descargarBlob(await respuesta.blob(), nombreArchivo);
}

/** Descarga un archivo generado en el navegador. */
export function descargarBlob(contenido: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
