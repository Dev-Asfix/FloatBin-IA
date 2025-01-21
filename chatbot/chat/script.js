// Verifica si el navegador soporta reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'es-ES'; // Idioma español
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const audioButton = document.getElementById('audio-button');
const audioIcon = document.getElementById('audio-icon');
// Botón para silenciar/reanudar el habla
const muteButton = document.getElementById('mute-button');
const muteIcon = document.getElementById('mute-icon');
// Botón para detener todo (reconocimiento y síntesis de voz)
const stopButton = document.getElementById('stop-button');

// Obtener referencias a los elementos del DOM
const noteInput = document.getElementById('note-input');
const addNoteButton = document.getElementById('add-note-button');
const listNotesButton = document.getElementById('list-notes-button');
const notesList = document.getElementById('notes-list');

// Simulación de almacenamiento de notas (puedes usar localStorage o un servidor real)
let notes = [];
let isMuted = false; // Estado inicial: no está silenciado


// Funciones para añadir, listar y eliminar notas
function addNote(note) {
  notes.push(note);
  updateNotesList();
}

// Función para limpiar el texto y eliminar etiquetas HTML y caracteres especiales
function stripHTML(text) {
  return text
    .replace(/<\/?[^>]+(>|$)/g, '') // Eliminar etiquetas HTML
    .replace(/&[a-z]+;/gi, '');    // Eliminar entidades HTML (&amp;, &lt;, etc.)
}





// GEMINI AI 
// Función para enviar mensajes a la API de Gemini
function sendToGemini(message) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBOZyQ6fIuqoUCeHIBpS1-h4sZVHWVRtFw";
  const data = {
    contents: [{ parts: [{ text: message }] }]
  };

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al comunicarse con la API de Gemini");
      }
      return response.json();
    })
    .then(data => {
      const responseText = data.contents[0]?.parts[0]?.text || "Sin respuesta.";
      return formatBotResponse(responseText);
    })
    .catch(error => {
      console.error("Error:", error);
      return "Lo siento, hubo un problema al procesar tu solicitud.";
    });
}

// Modificar la función para enviar el mensaje al servidor o a Gemini
function sendMessageToServer(message) {
  // Mostrar la animación de "escribiendo"
  displayLoadingAnimation();

  sendToGemini(message)
    .then(response => {
      // Eliminar la animación y mostrar la respuesta
      removeLoadingAnimation();
      displayBotResponse(response);
    })
    .catch(() => {
      removeLoadingAnimation();
      displayBotResponse("Lo siento, algo salió mal.");
    });
}








function updateNotesList() {
  notesList.innerHTML = ''; // Limpiar lista de notas
  notes.forEach((note, index) => {
    const noteItem = document.createElement('li');
    noteItem.textContent = note;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.onclick = () => {
      notes.splice(index, 1); // Eliminar la nota de la lista
      updateNotesList();
    };
    noteItem.appendChild(deleteButton);
    notesList.appendChild(noteItem);
  });
}

function listNotes() {
  if (notes.length === 0) {
    speak('No tienes notas guardadas.');
  } else {
    let notesText = 'Tienes las siguientes notas: ';
    notes.forEach((note, index) => {
      notesText += `Nota ${index + 1}: ${note}. `;
    });
    speak(notesText); // Reproduce las notas en voz
  }
}

// Evento para añadir nota desde la interfaz
addNoteButton.addEventListener('click', () => {
  const noteContent = noteInput.value.trim();
  if (noteContent) {
    addNote(noteContent);
    noteInput.value = ''; // Limpiar el campo de entrada
    speak('Nota añadida.');
  } else {
    speak('Por favor, escribe una nota.');
  }
});

// Evento para listar todas las notas desde la interfaz
listNotesButton.addEventListener('click', listNotes);


// Detener todo lo que esté activo (reconocimiento y síntesis de voz)
stopButton.addEventListener('click', () => {
  stopAllProcesses();
});

// Función para detener todo
function stopAllProcesses() {
  // Detener el reconocimiento de voz si está activo
  if (recognition) {
    recognition.abort(); // Detiene el reconocimiento de voz
  }

  // Detener cualquier síntesis de voz en curso
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel(); // Detiene la voz que se esté reproduciendo
  }

  // Limpiar cualquier animación o texto
  $('.message-input').val(''); // Limpiar el cuadro de texto
  removeLoadingAnimation(); // Eliminar cualquier animación de "escribiendo"

  console.log("Todos los procesos han sido detenidos.");
}

// Cambiar icono y activar reconocimiento de voz
audioButton.addEventListener('click', () => {
  recognition.start();
  audioButton.classList.add('message-input');
  audioIcon.src = "/chatbot/images/audio111.png"; // Cambia el ícono mientras escucha
});

// Cambiar el estado de silenciado y el ícono
muteButton.addEventListener('click', () => {
  isMuted = !isMuted; // Cambiar el estado
  if (isMuted) {
    muteIcon.src = "/chatbot/images/audio111.png"; // Ícono de silenciado
  } else {
    muteIcon.src = "/chatbot/images/audio000.png"; // Ícono de micrófono normal
  }
});



// Procesar el resultado de la voz reconocida
recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript.toLowerCase(); // Convertir en minúsculas
  $('.message-input').val(speechResult); // Insertar el texto en el cuadro de mensaje
  handleVoiceCommand(speechResult); // Manejar comandos de voz
  stopAudioRecognition();
};


recognition.onerror = (event) => {
  stopAudioRecognition();
  console.error('Error al reconocer:', event.error);
};


// Manejar comandos de voz específicos
// Modificación del reconocimiento de voz para manejar notas
function handleVoiceCommand(command) {
  if (command.includes('añadir nota')) {
    const noteContent = command.replace('añadir nota', '').trim();
    if (noteContent) {
      addNote(noteContent);
      speak('Nota añadida.');
    } else {
      speak('No escuché ninguna nota para añadir.');
    }
  } else if (command.includes('consultar notas')) {
    listNotes();
  } else if (command.includes('eliminar nota')) {
    const noteIndex = parseInt(command.match(/\d+/)) - 1; // Extraer el número de la nota
    if (!isNaN(noteIndex) && noteIndex < notes.length) {
      notes.splice(noteIndex, 1); // Eliminar la nota
      updateNotesList();
      speak(`Nota ${noteIndex + 1} eliminada.`);
    } else {
      speak('No pude entender el número de nota a eliminar.');
    }
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
  } else {
    // Otros comandos preexistentes o no reconocidos
    sendMessageToServer(command);
  }
}



// Reiniciar el estado después de terminar el reconocimiento
recognition.onspeechend = () => {
  stopAudioRecognition();
};



// Función para detener la animación y restaurar el icono
function stopAudioRecognition() {
  audioButton.classList.remove('message-input');
  audioIcon.src = "/chatbot/images/micro.png"; // Vuelve al icono de micrófono
}



var $messages = $('.messages-content'),
  d, h, m,
  i = 0;

$(window).load(function () {
  $messages.mCustomScrollbar();
  setTimeout(function () {

  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

function setDate() {
  d = new Date();
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();

  // Mostrar la animación de "escribiendo"
  displayLoadingAnimation();

  // Simulate server response (replace this with actual server call)
  sendMessageToServer(msg);
}

$('.message-submit').click(function () {
  insertMessage();
});

$(window).on('keydown', function (e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

// Function to send message to the server
function sendMessageToServer(message) {
  $.ajax({
    url: 'http://localhost:3000/api/chat',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ message: message }),
    success: function (data) {
      // Remove the loading animation once response arrives
      removeLoadingAnimation();
      // Display formatted response
      displayBotResponse(formatBotResponse(data.response));
    },
    error: function () {
      removeLoadingAnimation();
      displayBotResponse("I'm sorry, something went wrong.");
    }
  });
}

// Función para mostrar respuesta del bot con formato
function displayBotResponse(response) {
  // Mostrar el texto formateado en la interfaz
  const formattedResponse = formatBotResponse(response); // Aplica formato (negritas, cursivas, etc.)
  $('<div class="message new"><figure class="avatar1"><img width="45px" src="/chatbot/images/Robot.png" /></figure>' + formattedResponse + '</div>')
    .appendTo($('.mCSB_container'))
    .addClass('new');
  setDate();
  updateScrollbar();

  // Hablar el texto sin formato
  speak(response); // Aquí pasa el texto original, no el formateado
}


// Función para usar la síntesis de voz y reproducir el audio solo si no está silenciado
function speak(text) {
  if (!isMuted) {
    const synth = window.speechSynthesis;
    const cleanText = stripHTML(text); // Limpia el texto antes de hablar
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';  // Ajustar al idioma alemán (de-DE)

    // Seleccionar la voz específica si está disponible
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.name === 'Microsoft SeraphinaMultilingual Online (Natural) - German (Germany) (de-DE)');

    if (selectedVoice) {
      utterance.voice = selectedVoice;  // Establecer la voz seleccionada
    } else {
      console.warn('La voz deseada no está disponible. Usando la voz por defecto.');
    }

    // Reproducir el texto
    synth.speak(utterance);
  }
}

// Display loading animation
function displayLoadingAnimation() {
  $('<div class="message loading new"><figure class="avatar1"><img width="45px" src="/chatbot/images/Robot.png" /></figure><span class="loading-dots">Escribiendo<span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();
}

// Remove loading animation
function removeLoadingAnimation() {
  $('.message.loading').remove();
  updateScrollbar();
}

// Función para formatear texto del bot (visual bonito)
function formatBotResponse(response) {
  return response
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Bloques de código
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Código en línea
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Negritas
    .replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Cursivas
}