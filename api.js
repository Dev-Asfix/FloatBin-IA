const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000; // Puerto para esta API local

// Middleware para parsear JSON en solicitudes
app.use(express.json());

// Ruta para recibir los datos y enviarlos al servidor en Vercel
app.post('/sendData', async (req, res) => {
  const { estado, distancia } = req.body;

  try {
    // Enviar los datos al servidor de Vercel
    const response = await axios.post('https://vercel.com/pablos-projects-2fba7e39/server', {
      estado,
      distancia,
    });

    // Enviar una respuesta de éxito
    res.json({
      message: 'Datos enviados exitosamente al servidor',
      serverResponse: response.data
    });
  } catch (error) {
    console.error('Error al enviar los datos:', error.message);
    res.status(500).json({ error: 'Error al enviar los datos al servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
