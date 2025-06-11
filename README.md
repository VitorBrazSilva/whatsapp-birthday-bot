# 🤖 WhatsApp Birthday Bot

Bot automatizado que verifica aniversariantes do dia, gera uma mensagem personalizada com ajuda da OpenAI e envia nos grupos certos do WhatsApp.

## 📦 Funcionalidades

- ✅ Lê aniversários de múltiplos grupos
- 🤖 Gera mensagens usando GPT-4 ou GPT-3.5
- 💬 Envia automaticamente no grupo correspondente
- 🕒 Executa todos os dias às 09:00 (via `node-cron`)

## 🧰 Tecnologias

- Node.js
- whatsapp-web.js
- OpenAI API
- node-cron
- Oracle Cloud Free Tier (opcional para 24/7)

## 🚀 Instalação local

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/whatsapp-birthday-bot.git
cd whatsapp-birthday-bot
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

Crie o arquivo `.env` com base no `.env.example`:

```env
OPENAI_API_KEY=sk-...
```

4. Rode o projeto

```bash
npm start
```

Será exibido um QR Code para parear com o WhatsApp.

## ☁️ Implantação 24/7 (Oracle Cloud Free Tier)

### Requisitos

- Conta na Oracle Cloud Free Tier
- Instalar Node.js, Git e Chromium:

```bash
sudo apt update
sudo apt install -y nodejs npm git chromium
```

### Clone e configure

```bash
git clone https://github.com/seu-usuario/whatsapp-birthday-bot.git
cd whatsapp-birthday-bot
npm install
cp .env.example .env
nano .env
```

### Rodar com PM2

```bash
npm install -g pm2
pm2 start index.js --name birthday-bot
pm2 startup
pm2 save
```

## 📁 Personalização

- Edite `src/aniversariantes.js` para atualizar os grupos, nomes e descrições.