/** Misma clave y valores que el sistema Zeus, para que la preferencia se lea igual en ambos. */
export const CLAVE_TEMA = "zeus-theme";
export const VALOR_TEMA_OSCURO = "dark";
export const VALOR_TEMA_CLARO = "light";
export const EVENTO_CAMBIO_TEMA = "zeus-theme-change";

/** Se ejecuta antes del primer pintado para evitar el destello del tema claro. */
export const SCRIPT_TEMA_INICIAL = `(function(){try{if(localStorage.getItem("${CLAVE_TEMA}")==="${VALOR_TEMA_OSCURO}")document.documentElement.classList.add("dark")}catch(e){}})();`;
