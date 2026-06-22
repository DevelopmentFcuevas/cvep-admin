/** 
 * ✔️ Helper global de errores.
 * 
 * Maneja errores de manera consistente en toda la aplicación.
 * Este módulo centraliza la lógica de manejo de errores para que 
 * los componentes puedan mostrar mensajes claros al usuario.
 * 
 * El objetivo es capturar errores de Axios (o cualquier otro error) y 
 * traducirlos en mensajes amigables para el usuario final.
*/
export const handleError = (error, setError) => {
    console.error("🔴 ERROR COMPLETO:", error);

    if (error.response) {
        console.error("📡 Backend:", error.response.data);
        
        setError(
            error.response.data.message ||
            "Ocurrió un problema en el servidor. Intenta nuevamente."
        );
    } else if (error.request) {
        setError("No pudimos conectarnos con el servidor. Verifica tu internet.");

    } else {
        setError("Ocurrió un error inesperado.");
    }

};

export default handleError;