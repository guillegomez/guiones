// Importamos el paquete necesario para usar la API de Google Gemini.
// Netlify lo instalará automáticamente por nosotros.
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Esta es la función principal que Netlify ejecutará.
// 'event' contiene la información de la petición que nos llega del frontend.
exports.handler = async (event) => {
  // Nos aseguramos de que solo aceptamos peticiones de tipo POST (más seguro).
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 1. OBTENEMOS LA CLAVE SECRETA DE LA API
    //    process.env.GEMINI_API_KEY es la forma segura de acceder a nuestra clave,
    //    que configuraremos más tarde en el panel de Netlify, NUNCA en el código.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. EXTRAEMOS LA PROMESA DEL USUARIO
    //    El texto que envió el frontend viene dentro de 'event.body'.
    const { promesa } = JSON.parse(event.body);

    // Si la promesa está vacía, devolvemos un error.
    if (!promesa) {
      return {
        statusCode: 400,
        body: "Por favor, introduce una promesa de valor.",
      };
    }

    // 3. CONSTRUIMOS EL PROMPT MAESTRO
    //    ¡Aquí es donde insertamos el prompt que creamos al principio!
    const prompt = `
            Rol: Eres un estratega de contenido digital y copywriter experto en reels virales. Tu tono es cercano, profesional y seguro.
            Misión: Generar 3 ideas diferentes y estratégicas para reels de alto impacto (45-60 segundos), basadas en la siguiente promesa de valor. Una de las ideas debe incluir un hook visual intrigante.
            Formato de Salida: Para cada idea, presenta un "Concepto", un "Gancho Potencial" y su "Alineación con el Objetivo". Usa un formato claro y legible, con negritas para los títulos.

            Promesa de Valor del Usuario: "${promesa}"
        `;

    // 4. LLAMAMOS A LA API DE GEMINI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. DEVOLVEMOS LA RESPUESTA AL FRONTEND
    //    Enviamos la respuesta de Gemini de vuelta a nuestra aplicación.
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text }),
    };
  } catch (error) {
    // Si algo va mal (ej. la API Key es incorrecta), devolvemos un error.
    console.error("Error al llamar a la API de Gemini:", error);
    return { statusCode: 500, body: "Error interno al procesar la solicitud." };
  }
};
