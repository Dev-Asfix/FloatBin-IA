// ml.js
const brain = require('brain.js');

// Crear una red neuronal
const net = new brain.NeuralNetwork();
let isTrained = false; // Variable para verificar si la red ha sido entrenada

// Función para entrenar la red con los datos históricos
function trainModel(states) {
  // Formatear los datos de entrenamiento
  const trainingData = states.map(state => ({
    input: { distancia: state.distancia / 100 }, // Normalización de distancia
    output: { tiempoParaLlenar: state.tiempoParaLlenar / 10000 } // Normalización del tiempo
  }));

  // Entrenar la red neuronal solo si hay suficientes datos
  if (trainingData.length > 5) { // Asegurarse de tener suficientes datos
    net.train(trainingData);
    isTrained = true; // Marcar que la red ha sido entrenada
    console.log('Red neuronal entrenada exitosamente.');
  } else {
    console.log('Datos insuficientes para entrenar la red.');
  }
}

// Función para predecir el tiempo de llenado
function predictFillTime(distancia) {
  if (!isTrained) {
    throw new Error("La red neuronal no ha sido entrenada todavía.");
  }
  const result = net.run({ distancia: distancia / 100 });
  return result.tiempoParaLlenar * 10000; // Desnormalizar el resultado
}

module.exports = { trainModel, predictFillTime };
