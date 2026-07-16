/** 
 * ✔️ Helper global de errores.
 * 
 * Maneja errores de manera consistente en toda la aplicación.
 * Este módulo centraliza la lógica de manejo de errores para que 
 * los componentes puedan mostrar mensajes claros al usuario.
 * 
 * El objetivo es capturar errores de Axios (o cualquier otro error) y 
 * traducirlos en mensajes amigables para el usuario final.
 * 
 * Forma de uso:
 * 1. Pasando callback: handleError(error, setError)  // actualiza estado directamente
 * 2. Devolviendo mensaje: const msg = handleError(error)  // retorna el mensaje como string
*/

const getFirstLaravelError = (errors) => {
    if (!errors || typeof errors !== 'object') {
        return null;
    }

    const firstField = Object.keys(errors)[0];
    const firstMessages = errors[firstField];

    if (Array.isArray(firstMessages) && firstMessages.length > 0) {
        return firstMessages[0];
    }

    if (typeof firstMessages === 'string') {
        return firstMessages;
    }

    return null;
};

export const handleError = (error, setError) => {
    console.error("🔴 ERROR COMPLETO:", error);

    let mensajeAmigable = "Ocurrió un error inesperado.";

    if (error.response) {
        console.error("📡 Backend:", error.response.data);

        const backendData = error.response.data;
        const backendMessage =
            typeof backendData === 'string'
                ? backendData
                : backendData?.message || getFirstLaravelError(backendData?.errors);

        mensajeAmigable =
            backendMessage ||
            "Ocurrió un problema en el servidor. Intenta nuevamente.";
    } else if (error.request) {
        mensajeAmigable = "No pudimos conectarnos con el servidor. Verifica tu internet.";
    }

    if (setError && typeof setError === 'function') {
        setError(mensajeAmigable);
    } else {
        return mensajeAmigable;
    }
};

export default handleError;