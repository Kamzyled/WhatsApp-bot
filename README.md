# WhatsApp AI Auto-Reply Bot (Baileys + OpenAI)

## What this is
This bot connects to your WhatsApp account and uses OpenAI to reply to messages in your own style.

## How it works
1. Deployed to Render as a Node.js app.
2. On first run, shows a QR code in logs.
3. You scan the QR with WhatsApp → Linked Devices.
4. Bot starts replying automatically using OpenAI.

## Deployment steps
- Push these files to GitHub.
- Create a Web Service on Render.
- Add `OPENAI_API_KEY` in Render's environment settings.
- Deploy and scan QR once.
