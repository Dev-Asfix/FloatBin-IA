const startButton = document.getElementById('start-button');
const responseElement = document.getElementById('response');
const transcriptElement = document.getElementById('transcript'); // Referencia al único párrafo

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
recognition.continuous = false; // Cambiar a true si quieres reconocimiento continuo

recognition.onstart = () => {
    responseElement.textContent = 'Escuchando...';
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    handleCommand(transcript);
    writeTranscript(transcript); // Mostrar la transcripción actual
};

recognition.onerror = (event) => {
    responseElement.textContent = 'Error al reconocer la voz: ' + event.error;
};

startButton.addEventListener('click', () => {
    recognition.start();
});

function handleCommand(command) {
    if (command.includes('hola')) {
        speak('Hola, ¿cómo estás? Pablito Aldair .');
    } else if (command.includes('dime la hora')) {
        const now = new Date();
        const time = now.toLocaleTimeString();
        speak('La hora actual es ' + time);
    } else if (command.includes('¿quién es pablo?')) {
        speak('Pablo es un ingeniero de software muy crack');
    } else if (command.includes('dime el clima')) {
        speak('Lo siento, no tengo acceso al clima en este momento.');
    } else if (command.includes('cuenta hasta 3')) {
        speak('Uno, dos, tres.');
    } else if (command.includes('abre google')) {
        window.open('https://www.google.com', '_blank');
        speak('Abriendo Google.');
    } else if (command.includes('apaga las luces')) {
        speak('Simulando apagar las luces.');
    } else {
        speak('No reconozco ese comando.');
    }
}

// Función para actualizar el párrafo con la transcripción en tiempo real
function writeTranscript(text) {
    transcriptElement.textContent = text; // Actualizar el contenido del párrafo
}

function speak(text) {
   
    //'Microsoft SeraphinaMultilingual Online (Natural) - German (Germany) (de-DE)'
    //'Microsoft Elena Online (Natural) - Spanish (Argentina) (es-AR)'

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE'; // Ajusta el idioma a español (Paraguay)

    // Seleccionar la voz específica si está disponible
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.name === 'Microsoft SeraphinaMultilingual Online (Natural) - German (Germany) (de-DE)');
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn('La voz deseada no está disponible. Usando la voz por defecto.');
    }

    synth.speak(utterance);
    responseElement.textContent = text;
}


// Listar las voces disponibles en el navegador
function listVoices() {
    // Asegurarse de que las voces estén cargadas
    if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = () => {
            const voices = synth.getVoices();
            voices.forEach((voice, index) => {
                console.log(`${index}: ${voice.name} (${voice.lang})`);
            });
        };
    } else {
        const voices = synth.getVoices();
        voices.forEach((voice, index) => {
            console.log(`${index}: ${voice.name} (${voice.lang})`);
        });
    }
}

listVoices();
