// Este evento se asegura de que nuestro código se ejecute solo cuando todo el contenido
// de la página (HTML y CSS) se haya cargado por completo.
document.addEventListener("DOMContentLoaded", () => {
  // 1. Identificamos los elementos del HTML.
  const generarBtn = document.getElementById("generarBtn");
  const promesaInput = document.getElementById("promesaInput");
  const resultadoDiv = document.getElementById("resultado");

  // 2. Le decimos al botón que "escuche" el evento 'click'.
  //    La función ahora es 'async' porque tiene que esperar la respuesta del servidor.
  generarBtn.addEventListener("click", async () => {
    // 3. Obtenemos el texto del usuario.
    const promesaTexto = promesaInput.value;

    // Validamos que el usuario haya escrito algo.
    if (!promesaTexto.trim()) {
      resultadoDiv.innerText =
        "Por favor, escribe tu promesa de valor antes de generar las ideas.";
      return;
    }

    // 4. MOSTRAMOS UN ESTADO DE CARGA
    //    Le damos feedback inmediato al usuario de que algo está pasando.
    generarBtn.disabled = true; // Desactivamos el botón para evitar múltiples clics.
    generarBtn.innerText = "Generando...";
    resultadoDiv.innerText =
      "🧠 La IA está pensando, por favor espera un momento...";

    // 5. LLAMAMOS A NUESTRA FUNCIÓN SERVERLESS (LA "COCINA")
    try {
      // 'fetch' hace la petición a la URL de nuestra función.
      // Netlify automáticamente hace que nuestras funciones estén disponibles
      // en la ruta '/.netlify/functions/NOMBRE_DEL_ARCHIVO'.
      const response = await fetch("/.netlify/functions/generar-ideas", {
        method: "POST", // Usamos el método POST porque estamos enviando datos.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promesa: promesaTexto }), // Enviamos la promesa en formato JSON.
      });

      // Si la respuesta del servidor no es exitosa, mostramos un error.
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Convertimos la respuesta (que está en formato JSON) a un objeto de JavaScript.
      const data = await response.json();

      // 6. MOSTRAMOS EL RESULTADO FINAL
      //    Mostramos la respuesta de Gemini en el div de resultados.
      resultadoDiv.innerText = data.reply;
    } catch (error) {
      // Si algo falla en la comunicación, mostramos un mensaje de error.
      console.error("Error al contactar la función:", error);
      resultadoDiv.innerText =
        "Lo sentimos, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.";
    } finally {
      // 7. REACTIVAMOS EL BOTÓN
      //    Pase lo que pase (éxito o error), volvemos a activar el botón.
      generarBtn.disabled = false;
      generarBtn.innerText = "Generar Ideas";
    }
  });
});
