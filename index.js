import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { GoogleGenAI } from "@google/genai";
import qrcode from 'qrcode-terminal'
import "dotenv/config"

const REMOTE_JID = process.env.REMOTE_JID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        auth: state
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect)
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('opened connection')
        }
    })

    // Function delay untuk read dan kirim message
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    sock.ev.on('messages.upsert', async (event) => {
        if (event.type !== 'notify') return
        for (const m of event.messages) {
            if (m.key.fromMe) continue

            const jid = m.key.remoteJid;
            if (REMOTE_JID !== jid) continue
            console.log(JSON.stringify(m, undefined, 2))

            console.log('replying to', jid)

            await delay(500 + Math.random() * 1500)
            await sock.readMessages([m.key])

            await delay(1000 + Math.random() * 2000)
            await sock.sendPresenceUpdate('composing', jid)
            
            await delay(1000 + Math.random() * 2000)

            // AI Generate
            const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

            const response = await ai.interactions.create({
                model: "gemini-3.1-flash-lite",
                input: `${m.message.conversation}`,
            });
            
            // Send Message
            await sock.sendMessage(jid, { text: response.output_text })
            await sock.sendPresenceUpdate('paused', jid)
        }
    })

    // Save credentials whenever they are updated
    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()