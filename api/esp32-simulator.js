const WebSocket = require('ws');

// Dirección del servidor WebSocket
const ws = new WebSocket('ws://192.168.18.20:3000/');

ws.on('open', function open() {
  console.log('Conectado al servidor WebSocket');
  simulateSensorData();
});

ws.on('message', function incoming(data) {
  console.log('Mensaje recibido del servidor:', data);
});

ws.on('close', function close() {
  console.log('Conexión cerrada');
});

// Simular los datos del sensor
function simulateSensorData() {
  setInterval(() => {

    const distance = Math.random() * 30; // Distancia aleatoria entre 0 y 100 cm

    let estado = getEstado(distance); // Determinar el estado basado en la distancia

    // Crear un objeto con los datos simulados
    const data = JSON.stringify({
      estado: estado,
      distancia: distance,
      timestamp: Date.now() // Usar timestamp en milisegundos
    });

    // Enviar los datos al servidor WebSocket
    ws.send(data);
    console.log(`Datos enviados: ${data}`);
  }, 4000); // Enviar cada 2 segundos
}

// Determinar el estado según la distancia simulada
function getEstado(distance) {
  if (distance > 30) {
    return 'Vacio';
  } else if (distance <= 30 && distance > 25) {
    return 'Bajo';
  } else if (distance <= 25 && distance > 20) {
    return 'Medio';
  } else if (distance <= 20 && distance > 10) {
    return 'Alto';
  } else {
    return 'Lleno';
  }
}
