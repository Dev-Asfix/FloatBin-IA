const startButton = document.getElementById('start-button');
const responseElement = document.getElementById('response');
const transcriptElement = document.getElementById('transcript');
const refreshButton = document.getElementById('refresh-button'); 
const stopButton = document.getElementById('stop-button');
const noteInput = document.getElementById('note-input');
const addNoteButton = document.getElementById('add-note-button');
const listNotesButton = document.getElementById('list-notes-button');
const notesList = document.getElementById('notes-list');


// Grupos de audios
const audioGroupHola = [];

for (let i = 1; i <= 23; i++) {
  audioGroupHola.push(`audios/audio${i}.mp3`);
}



const audioGroupNotas = [];
for (let i = 1; i <= 3; i++) {
    audioGroupNotas.push(`audios/notas/audio${i}.mp3`);
  }




function playRandomAudio(audioGroup) {
    const randomIndex = Math.floor(Math.random() * audioGroup.length);
    const audio = new Audio(audioGroup[randomIndex]);
    audio.play();
}


refreshButton.addEventListener('click', () => {
    location.reload(); // Recargar la página al hacer clic
});

stop-stopButton.addEventListener('click', () => {
    recognition.stop();
});

// Simulación de almacenamiento de notas (puedes usar localStorage o un servidor real)
let notes = [];

// Funciones para añadir, listar, eliminar y reproducir notas
function addNote(note) {
    notes.push(note);
    updateNotesList();
}


function updateNotesList() {
    notesList.innerHTML = ''; // Limpiar lista
    notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.textContent = note;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => {
            notes.splice(index, 1);
            updateNotesList();
        };
        noteItem.appendChild(deleteButton);
        notesList.appendChild(noteItem);
    });
}

function listNotes() {
    if (notes.length === 0) {
        playRandomAudio(audioGroupNotas);
    } else {
        let notesText = 'Tienes las siguientes notas: ';
        notes.forEach((note, index) => {
            notesText += `Nota ${index + 1}: ${note}. `;
        });
        speak(notesText);
    }
}

// Evento para añadir nota
addNoteButton.addEventListener('click', () => {
    const note = noteInput.value;
    if (note) {
        addNote(note);
        noteInput.value = ''; // Limpiar el input
        speak('Nota añadida.');
    } else {
        speak('Por favor, escribe una nota.');
    }
});

// Evento para consultar notas
listNotesButton.addEventListener('click', listNotes);

// Reconocimiento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
recognition.continuous = false;

recognition.onstart = () => {
    responseElement.textContent = 'Escuchando...';
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    handleCommand(transcript);
    writeTranscript(transcript);
};

recognition.onerror = (event) => {
    responseElement.textContent = 'Error al reconocer la voz: ' + event.error;
};

startButton.addEventListener('click', () => {
    recognition.start();
});

stopButton.addEventListener('click', () => {
    recognition.stop();
    responseElement.textContent = 'Reconocimiento de voz detenido.';
});



function handleCommand(command) {
    if (command.includes('añadir nota')) {
        const note = command.replace('añadir nota', '').trim(); // Extrae el contenido de la nota
        if (note) {
            addNote(note);
        } else {
            speak('No escuché ninguna nota para añadir.');
        }
    } else if (command.includes('consultar notas')) {
        listNotes();
    } else if (command.includes('actualizar nota')) {
        const noteIndex = parseInt(command.match(/\d+/)) - 1; // Extrae el número de la nota
        const newNote = command.replace(/actualizar nota \d+/, '').trim(); // Extrae el nuevo contenido de la nota
        if (!isNaN(noteIndex) && newNote) {
            updateNote(noteIndex, newNote);
        } else {
            speak('No pude entender el número de nota o el nuevo contenido.');
        }
    } else if (command.includes('eliminar nota')) {
        const noteIndex = parseInt(command.match(/\d+/)) - 1; // Extrae el número de la nota
        if (!isNaN(noteIndex)) {
            deleteNote(noteIndex);
        } else {
            speak('No pude entender el número de nota a eliminar.');
        }
    } else if (command.includes('reproducir nota')) {
        const noteIndex = parseInt(command.match(/\d+/)) - 1; // Extrae el número de la nota
        if (!isNaN(noteIndex)) {
            playNote(noteIndex);
        } else {
            speak('No pude entender el número de nota a reproducir.');
        }
    } else if (command.includes('hola')) {
        playRandomAudio(audioGroupHola);
        /* speak('Hola, ¿cómo estás? Pablito Aldair .'); */
    } else if (command.includes('dime la hora')) {
        const now = new Date();
        const time = now.toLocaleTimeString();
        speak('La hora actual es ' + time);
    } else if (command.includes('dime el nivel')) {
        fetch('/estado')
            .then(response => response.json())
            .then(data => {
                speak(`El nivel actual es ${data.estado}`);
            })
            .catch(error => {
                speak('Lo siento, no puedo obtener el nivel en este momento.');
                console.error('Error al obtener el nivel:', error);
            });
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
    } else if (command.includes('temporizador')) {
        // Extrae el tiempo y la unidad (minutos o segundos)
        const timeMatch = command.match(/(\d+)\s*(minutos|segundos)/);
        if (timeMatch) {
            const timeValue = parseInt(timeMatch[1]);
            const timeUnit = timeMatch[2];
            let totalMilliseconds = timeUnit === 'minutos' ? timeValue * 60 * 1000 : timeValue * 1000;
            startTimer(totalMilliseconds);
        } else {
            speak('No entendí el tiempo para el temporizador. Usa un formato como "temporizador de 5 minutos" o "temporizador de 30 segundos".');
        }
    } else if(command.includes('ayuda')) {
        speak('Aquí tienes los comandos disponibles:');
        speak('1. Añadir nota: "añadir nota [contenido]"');
        speak('2. Consultar notas: "consultar notas"');
        speak('3. Actualizar nota: "actualizar nota [número] [nuevo contenido]"');
        speak('4. Eliminar nota: "eliminar nota [número]"');
        speak('5. Reproducir nota: "reproducir nota [número]"');
        speak('6. Saludar: "hola"');
        speak('7. Decir la hora: "dime la hora"');
        speak('8. Consultar el nivel del tacho: "dime el nivel"');
        speak('9. Preguntar quién es Pablo: "¿quién es pablo?"');
        speak('10. Consultar el clima: "dime el clima"');
        speak('11. Contar hasta 3: "cuenta hasta 3"');
        speak('12. Abrir Google: "abre google"');
        speak('13. Apagar las luces: "apaga las luces"');
        speak('14. Temporizador: "temporizador de [número] [minutos|segundos]"');
    } else {
        speak('No reconozco ese comando.');
    }
}

function startTimer(duration) {
    speak(`Temporizador de ${duration / 1000} segundos iniciado.`); // Anuncia el inicio del temporizador
    setTimeout(() => {
        speak('¡Tiempo completado!'); // Anuncia que el tiempo se ha completado
    }, duration);
}


// Función para actualizar el párrafo con la transcripción en tiempo real
function writeTranscript(text) {
    transcriptElement.textContent = text;
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

