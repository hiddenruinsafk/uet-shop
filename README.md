# 🎨 ATELIER — E-Commerce

## Installazione rapida

### 1. Installa Node.js
Scarica da https://nodejs.org (versione LTS)

### 2. Apri il terminale in questa cartella
```
cd atelier-deploy
npm install
npm run dev
```
Il sito gira su http://localhost:5173

### 3. Deploy gratuito su Vercel
```
npm install -g vercel
vercel
```
Segui le istruzioni → il sito sarà online in 2 minuti.

## Admin Panel
Clicca **5 volte rapide** sul logo ATELIER
Password default: `atelier2024` (cambiala subito in Config)

## Email ordini
Registrati su https://emailjs.com e configura le credenziali in Admin → Config

## ⚠️ Nota storage
I prodotti e gli ordini sono salvati nel browser (localStorage).
- ✅ Perfetto per iniziare
- ⚠️ I dati sono sul browser locale: usa sempre lo stesso browser per l'admin
- 🔄 Per sincronizzazione multi-dispositivo: contatta lo sviluppatore per integrare Firebase
