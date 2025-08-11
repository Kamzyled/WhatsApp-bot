require('dotenv').config();
const { makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });

  sock.ev.on('connection.update', ({ connection, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') console.log('✅ Bot connected to WhatsApp');
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    console.log('📩 Message:', text);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: process.env.BOT_PERSONA },
          { role: 'user', content: text }
        ]
      });

      const reply = response.choices[0].message.content;
      await sock.sendMessage(msg.key.remoteJid, { text: reply });
      console.log('🤖 Replied:', reply);
    } catch (err) {
      console.error('❌ Error generating reply:', err);
    }
  });
}

connectBot();
