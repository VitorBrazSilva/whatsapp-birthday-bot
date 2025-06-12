import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcodePkg from 'qrcode-terminal';
const qrcode = qrcodePkg;

import cron from 'node-cron';
import { aniversariantesPorGrupoHoje } from './src/aniversariantes.js';
import { gerarMensagem } from './src/openai.js';

const client = new Client({ authStrategy: new LocalAuth() });
let chatsCarregados = false;

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('🤖 Bot pronto e conectado ao WhatsApp!');

  try {
    await client.getChats(); // força o carregamento interno
    chatsCarregados = true;
    console.log('💬 Chats carregados com sucesso.');
    executarAgora();
  } catch (e) {
    console.error('❌ Erro ao carregar os chats inicialmente:', e);
  }

  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Executando agendamento diário...');

    if (!chatsCarregados) {
      console.log('⚠️ Chats ainda não carregados. A execução foi ignorada.');
      return;
    }

    try {
      const gruposHoje = aniversariantesPorGrupoHoje();
      if (gruposHoje.length === 0) {
        console.log('Nenhum grupo tem aniversariantes hoje.');
        return;
      }

      const chats = await client.getChats();

      for (const grupo of gruposHoje) {
        const chat = chats.find(c => c.name === grupo.nomeGrupo);
        if (!chat) {
          console.warn(`Grupo não encontrado: ${grupo.nomeGrupo}`);
          continue;
        }

        for (const pessoa of grupo.aniversariantes) {
          const mensagem = await gerarMensagem(pessoa.nome, pessoa.descricao);
          await chat.sendMessage(mensagem);
          console.log(`✅ Mensagem enviada para ${pessoa.nome} em ${grupo.nomeGrupo}`);
        }
      }
    } catch (err) {
      console.error('Erro na execução agendada:', err);
    }
  });
});

client.initialize();

async function executarAgora() {
  console.log('⏱️ Executando manualmente o bot de aniversários...');

  try {
    const gruposHoje = aniversariantesPorGrupoHoje();
    if (gruposHoje.length === 0) {
      console.log('🙁 Nenhum grupo tem aniversariantes hoje.');
      return;
    }

    const chats = await client.getChats();

    for (const grupo of gruposHoje) {
      const chat = chats.find(c => c.name === grupo.nomeGrupo);
      if (!chat) {
        console.warn(`⚠️ Grupo não encontrado: ${grupo.nomeGrupo}`);
        continue;
      }

      for (const pessoa of grupo.aniversariantes) {
        const mensagem = await gerarMensagem(pessoa.nome, pessoa.descricao);
        await chat.sendMessage(mensagem);
        console.log(`🎉 Mensagem enviada para ${pessoa.nome} em ${grupo.nomeGrupo}`);
      }
    }
  } catch (err) {
    console.error('Erro na execução manual:', err);
  }
}