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

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('🤖 Bot pronto e conectado ao WhatsApp!');

  try {
    await client.getChats();
    console.log('💬 Chats carregados com sucesso.');
  } catch (e) {
    console.error('❌ Erro ao carregar chats na inicialização:', e);
  }

  executarAgora();

  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Verificando aniversários por grupo...');
    try {
      await executarAgora();
    } catch (e) {
      console.error('Erro na execução agendada:', e);
    }
  });
});

client.initialize();

async function executarAgora() {
  console.log('⏱️ Executando manualmente o bot de aniversários...');

  const gruposHoje = aniversariantesPorGrupoHoje();
  if (gruposHoje.length === 0) {
    console.log('🙁 Nenhum grupo tem aniversariantes hoje.');
    return;
  }

  let chats = [];
  try {
    chats = await client.getChats();
    chats = chats.filter(c => c && typeof c.name === 'string');
  } catch (e) {
    console.error('❌ Erro ao buscar chats:', e);
    return;
  }

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
}