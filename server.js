const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const { trainModel, predictFillTime } = require('./ml/ml'); // Importar la red neuronal
const { sendWhatsAppMessage } = require('./api/wpp');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const API_KEY = 'AIzaSyDK7fN73zyVMYsj0g_ZP5HOKyOlZfTouxI';

let lastData = {};
let states = [];
let fullTimes = [];
let averageFillTime = 0;

app.use(cors());
app.use(express.json());

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
    lastData = { ...data, timestamp: new Date().toLocaleString() };

    // Guardar el tiempo de llenado si el estado es "Lleno"
    if (data.estado === 'Lleno') {
      fullTimes.push(data.timestamp);
      calculateAverageFillTime();

      // Enviar un mensaje de WhatsApp cuando el estado sea "Lleno"
      /* sendWhatsAppMessage('whatsapp:+51925418808', 'El tacho está lleno.')
       .then(() => console.log('Mensaje de WhatsApp enviado.'))
       .catch(error => console.error('Error al enviar el mensaje de WhatsApp:', error)); */

    }

    // Guardar el estado para entrenar la red neuronal
    if (data.estado !== 'Lleno') {
      states.push({ distancia: data.distancia, tiempoParaLlenar: averageFillTime });
    }

    // Entrenar la red neuronal
    if (states.length > 5) {
      trainModel(states);
    }

    // Hacer predicción si la red ha sido entrenada y el estado no es "Lleno"
    if (data.estado !== 'Lleno' && states.length > 5) {
      try {
        const predictedTime = predictFillTime(data.distancia);
        lastData.predictedFillTime = predictedTime;
      } catch (error) {
        console.error(error.message);
      }
    }

    states.push(lastData);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...lastData, averageFillTime }));
      }
    });
  });
});

function calculateAverageFillTime() {
  if (fullTimes.length >= 2) {
    const totalFillTime = new Date(fullTimes[fullTimes.length - 1]) - new Date(fullTimes[0]);
    averageFillTime = totalFillTime / (fullTimes.length - 1);
  }
}









// Ruta para manejar la solicitud del chatbot
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // Almacenamos el contexto de la conversación
  let context = req.body.context || []; // Obtiene el contexto previo si lo hay

  // Analizamos el mensaje del usuario y lo clasificamos
  const estadoIntent = [
    'dime el nivel del tacho',
    'dame el nivel',
    'dame el estado',
    'en qué nivel está',
    'cómo está el nivel del tacho',
    'nivel actual',
    'estado actual del tacho'
  ];

  // Si el mensaje es sobre el estado del tacho
  if (estadoIntent.some(intent => userMessage.includes(intent))) {
    if (lastData && lastData.estado) {
      let response = `El nivel del tacho es: ${lastData.estado}.`;

      // Recomendaciones dinámicas con respuestas al azar
      switch (lastData.estado) {
        case 'Lleno':
          const llenoResponses = [
            '¡El tacho está lleno! Es crucial vaciarlo ahora para evitar cualquier desbordamiento.',
            '¡Atención! El tacho está completamente lleno. Si no lo vacías, podrías tener un problema de desbordamiento.',
            '¡El tacho ha alcanzado su capacidad máxima! Por favor, vacíalo para evitar daños o desbordes.',
            '¡Es hora de vaciar el tacho! Si no lo haces pronto, el desbordamiento será inevitable.',
            'El tacho ya no tiene más espacio. ¡Vacíalo antes de que se desborde y cause un problema!',
            'El tacho está lleno al máximo. No esperar más podría generar inconvenientes. ¡Es el momento de vaciarlo!',
            '¡Está a punto de desbordarse! Vacíalo inmediatamente para evitar mayores complicaciones.',
            '¡El tacho está lleno! Si no lo vacías, el exceso podría causar problemas serios. ¡Hazlo ahora!',
            '¡El tacho ya no puede contener más! Actúa rápidamente y vacíalo antes de que cause un desbordamiento.',
            '¡Es urgente vaciar el tacho ahora! De lo contrario, el riesgo de desbordamiento es muy alto.',
          ];

          response += llenoResponses[Math.floor(Math.random() * llenoResponses.length)];
          break;

        case 'Vacio':
          const vacioResponses = [
            'El tacho está vacío. ¿Quieres estimar cuánto tiempo tomará llenarse?',
            'Está vacío. Puedo calcular cuánto tardará en llenarse si lo deseas.',
            'El tacho está vacío. ¿Te interesa saber cómo podemos predecir su llenado?',
            'El tacho está vacío. ¿Quieres que te diga cuándo podría empezar a llenarse?',
            'Está vacío ahora. ¿Te gustaría una estimación de su tiempo de llenado?',
            'El tacho está vacío. Puedo calcular el tiempo para que se llene si lo necesitas.',
            'Está vacío. ¿Te gustaría recibir una predicción de cuándo se llenará?',
            'El tacho está vacío. Puedo proporcionarte una estimación para su llenado.',
            'Está vacío. ¿Quieres calcular el tiempo que tomará llenarse?',
            'El tacho está vacío. ¿Te gustaría saber cuándo podría alcanzar el nivel máximo?',
          ];
          response += vacioResponses[Math.floor(Math.random() * vacioResponses.length)];
          break;

        case 'Bajo':
          const bajoResponses = [
            'El nivel está bajo, pero aún queda bastante espacio.',
            'El tacho tiene espacio suficiente, aunque está empezando a llenarse.',
            'El nivel del tacho es bajo. Aún tienes margen para añadir más.',
            'Aún hay espacio considerable en el tacho, pero se está llenando gradualmente.',
            'El tacho está en nivel bajo, lo que significa que aún puedes agregar más.',
            'Aunque el nivel es bajo, sigue habiendo suficiente espacio disponible.',
            'El tacho tiene espacio, pero el nivel está en aumento.',
            'El nivel es bajo, lo que indica que todavía hay capacidad disponible.',
            'El tacho aún tiene espacio, pero es una buena idea empezar a planear su vaciado.',
            'Aunque el tacho está bajo, está llegando a un punto donde deberías estar atento al llenado.',
          ];

          response += bajoResponses[Math.floor(Math.random() * bajoResponses.length)];
          break;

        case 'Medio':
          const medioResponses = [
            'El nivel está medio. Considera vaciarlo pronto para evitar que se llene completamente.',
            'Está medio lleno. Es buen momento para vaciarlo antes de que suba más.',
            'El nivel está a mitad. Planifica vaciarlo para mantener el control.',
            'Nivel medio. Vacíalo pronto para optimizar su capacidad.',
            'El tacho está a la mitad. Es recomendable vaciarlo antes de que se acerque al máximo.',
            'Nivel medio alcanzado. Vaciado recomendado para evitar sobrecargas.',
            'Está medio lleno. Planifica el vaciado pronto para mantener el equilibrio.',
            'El nivel está en la mitad. Es el momento ideal para vaciarlo y prevenir desbordes.',
            'Nivel intermedio. Vaciarlo ahora podría prevenir problemas más adelante.',
            'El nivel está medio. Un vaciado temprano podría ser la mejor opción.',
          ];
          response += medioResponses[Math.floor(Math.random() * medioResponses.length)];
          break;

        case 'Alto':
          const altoResponses = [
            'El nivel está alto. Es recomendable vaciarlo pronto.',
            '¡Atención! El tacho está cerca de llenarse. Vacíalo pronto.',
            'El nivel es alto. Te sugiero vaciarlo antes de que se llene completamente.',
            '¡Cuidado! El tacho está por desbordarse. Actúa rápido.',
            'El nivel está alto. Vacíalo pronto para evitar problemas.',
            'El tacho está casi lleno. Es el momento de vaciarlo.',
            'El nivel está alto. Un vaciado pronto evitará el desbordamiento.',
            '¡Atención! El tacho está a punto de llenarse. Te recomiendo vaciarlo.',
            'El nivel está alto. Actúa rápido y vacíalo para evitar desbordes.',
            'El tacho está casi lleno. Vacíalo pronto para mantener todo en orden.'
          ];
          response += altoResponses[Math.floor(Math.random() * altoResponses.length)];
          break;

        default:
          response += 'Estado desconocido. Verifica los sensores.';
      }

      // Respuesta adicional si el usuario confirma con "sí" o "por favor"
      if (userMessage.includes('sí') || userMessage.includes('por favor')) {
        switch (lastData.estado) {
          case 'Lleno':
            const llenoConfirmResponses = [
              '¡Es necesario vaciarlo lo antes posible para evitar problemas!',
              'Es crucial vaciarlo ahora mismo para evitar desbordes.',
              'Vaciar el tacho de inmediato ayudará a prevenir cualquier inconveniente.',
            ];
            response += llenoConfirmResponses[Math.floor(Math.random() * llenoConfirmResponses.length)];
            break;

          case 'Vacio':
            const vacioConfirmResponses = [
              'Puedo calcular cuánto tiempo tomará para empezar a llenarse si lo deseas.',
              'Si quieres, te puedo estimar el tiempo que tardará en llenarse.',
              'Puedo hacer una estimación de cuánto tiempo tomará en llenarse, solo dímelo.',
            ];
            response += vacioConfirmResponses[Math.floor(Math.random() * vacioConfirmResponses.length)];
            break;

          case 'Bajo':
            const bajoConfirmResponses = [
              'A este ritmo, tardará un tiempo considerable en llenarse.',
              'En este estado, tomará algo de tiempo llenar el tacho completamente.',
              'El llenado tomará un tiempo dependiendo de las condiciones actuales.',
            ];
            response += bajoConfirmResponses[Math.floor(Math.random() * bajoConfirmResponses.length)];
            break;

          case 'Medio':
            const medioConfirmResponses = [
              'Podría llenarse pronto dependiendo del uso. ¿Te gustaría un cálculo más detallado?',
              'Es posible que se llene pronto si el ritmo continúa. ¿Quieres saber más?',
              'Dependiendo de la actividad, podría llenarse en poco tiempo. ¿Te interesa más información?',
            ];
            response += medioConfirmResponses[Math.floor(Math.random() * medioConfirmResponses.length)];
            break;

          case 'Alto':
            const altoConfirmResponses = [
              'Está muy cerca de llenarse. Te recomiendo vaciarlo pronto.',
              'El nivel está tan alto que deberías vaciarlo pronto para evitar desbordes.',
              'Te recomiendo vaciar el tacho pronto antes de que se llene completamente.',
            ];
            response += altoConfirmResponses[Math.floor(Math.random() * altoConfirmResponses.length)];
            break;
        }
      }

      context.push(response); // Actualizamos el contexto
      return res.json({ response, context });
    } else {
      return res.json({ response: 'Aún no tengo datos del nivel del tacho. Por favor, verifica la conexión con el sensor.' });
    }
  }

  // Llamada a la API Gemini para otros mensajes
  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      { contents: [{ parts: [{ text: userMessage }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const botResponse = geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Lo siento, no puedo responder a eso ahora. ¿Te gustaría preguntar sobre el estado del tacho?';

    context.push(botResponse); // Actualizamos el contexto
    res.json({ response: botResponse, context });

  } catch (error) {
    console.error('Error al conectar con Gemini:', error.message);
    res.status(500).json({ error: 'Error al conectar con la IA.' });
  }
});



// Servir la carpeta principal 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta del chatbot en la ruta '/chatbot'
app.use('/chatbot', express.static(path.join(__dirname, 'chatbot')));

// Servir la carpeta del chatbot en la ruta '/chatbot'
app.use('/', express.static(path.join(__dirname, '/')));
// Ruta para tu aplicación en 'dashboard'
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'app.html'));
});


// Nueva ruta para obtener el estado actual
app.get('/estado', (req, res) => {
  if (lastData.estado) {
    res.json({ estado: lastData.estado });
  } else {
    res.json({ estado: 'No disponible' });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
