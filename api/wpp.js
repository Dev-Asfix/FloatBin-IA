const twilio = require('twilio');

// Configuración de Twilio

const accountSid = process.env.TWILIO_ACCOUNT_SID; // SID desde .env

const authToken = process.env.TWILIO_AUTH_TOKEN;   // Token desde .env

const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, body) {
    return client.messages
        .create({
            body: body,
            from: 'whatsapp:+14155238886', // El número de Twilio para WhatsApp
            to: to
        })
        .then(message => {
            console.log(`Mensaje enviado con SID: ${message.sid}`);
            return message;
        })
        .catch(error => {
            console.error('Error al enviar el mensaje:', error);
            throw error;
        });
}

module.exports = { sendWhatsAppMessage };
