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
 





app.use(cors());
app.use(express.json());


// Ruta para manejar la solicitud del chatbot
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        // Llamada a la API de Gemini con la clave API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }]
                
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extraer el texto de la respuesta
        if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
            const botResponseParts = response.data.candidates[0].content.parts;

            // Obtener el texto desde parts[0].text
            const botResponse = botResponseParts && botResponseParts[0] && botResponseParts[0].text
                ? botResponseParts[0].text
                : 'Lo siento, no tengo una respuesta en este momento.';

            res.json({ response: botResponse });
        } else {
            res.status(500).json({ error: 'Formato de respuesta inesperado de la API' });
        }
    } catch (error) {
        console.error('Error al conectarse con la API de Gemini:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al conectarse con la API de Gemini' });
    }
});



// Servir la carpeta principal 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta del chatbot en la ruta '/chatbot'
app.use('/chatbot', express.static(path.join(__dirname, 'chatbot')));

// Servir la carpeta del chatbot en la ruta '/chatbot'
app.use('/', express.static(path.join(__dirname, '/')));


// Nueva ruta para obtener el estado actual
app.get('/estado', (req, res) => {
  if (lastData.estado) {
    res.json({ estado: lastData.estado });
  } else {
    res.json({ estado: 'No disponible' });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
