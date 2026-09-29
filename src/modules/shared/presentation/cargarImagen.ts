export const LOGO_ZEUS = "/images/logo-zeus-safety-pdf.png";
export const LOGO_ZEUS_BLANCO = "/images/logo-zeus-safety-blanco.png";

/** Lee una imagen pública como data URL, formato que exigen jsPDF y ExcelJS para incrustarla. */
export async function cargarImagenComoDataUrl(ruta: string): Promise<string> {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar la imagen ${ruta}.`);
  }
  const blob = await respuesta.blob();
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result as string);
    lector.onerror = () => rechazar(new Error(`No se pudo leer la imagen ${ruta}.`));
    lector.readAsDataURL(blob);
  });
}
