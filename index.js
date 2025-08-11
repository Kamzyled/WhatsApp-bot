import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    auth: state,
    version
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update
    if (qr) {
      console.log('Scan this QR to login:')
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'open') {
      console.log('✅ WhatsApp bot connected!')
    }
  })

  sock.ev.on('messages.upsert', async (msgUpdate) => {
    const message = msgUpdate.messages[0]
    if (!message.message || message.key.fromMe) return

    const from = message.key.remoteJid
    const text = message.message.conversation || message.message.extendedTextMessage?.text || ''

    console.log(`💬 New message from ${from}: ${text}`)

    try {
      const reply = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Kamzy, a friendly but smart person. Reply in Kamzy’s tone.' },
          { role: 'user', content: text }
        ]
      })

      const aiReply = reply.choices[0].message.content
      await sock.sendMessage(from, { text: aiReply })
      console.log(`🤖 Replied: ${aiReply}`)
    } catch (err) {
      console.error('Error generating AI reply:', err)
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startBot()
