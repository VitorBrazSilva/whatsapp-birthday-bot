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

  // Aguarda 5 segundos para garantir que os chats estejam carregados
  await new Promise(resolve => setTimeout(resolve, 5000));

  await executarAgora();

  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Verificando aniversários por grupo...');
    try {
      await executarAgora();
    } catch (err) {
      console.error('❌ Erro na execução agendada:', err);
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

  let chats;
  try {
    chats = await client.getChats();
  } catch (err) {
    console.error('❌ Erro ao buscar chats:', err);
    return;
  }

  for (const grupo of gruposHoje) {
    const chat = chats.find(c => c?.name === grupo.nomeGrupo);

    if (!chat) {
      console.warn(`⚠️ Grupo não encontrado: ${grupo.nomeGrupo}`);
      continue;
    }

    for (const pessoa of grupo.aniversariantes) {
      try {
        const mensagem = await gerarMensagem(pessoa.nome, pessoa.descricao);
        await chat.sendMessage(mensagem);
        console.log(`🎉 Mensagem enviada para ${pessoa.nome} em ${grupo.nomeGrupo}`);
      } catch (err) {
        console.error(`❌ Falha ao enviar mensagem para ${pessoa.nome}:`, err);
      }
    }
  }
}