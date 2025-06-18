import OpenAI from "openai";

export async function gerarMensagem(nome, descricao) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ move para dentro

  const prompt = `Crie uma mensagem de parabéns para ${nome}, com seguintes descrições ${descricao}`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function gerarResumoDoDia(mensagens) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Você é um bot de resumo de grupo. Abaixo estão as mensagens trocadas entre os membros hoje. Gere um breve resumo em até 3 parágrafos com as principais ideias e fatos discutidos. Não cite nomes nem horários.

Mensagens:
"""
${mensagens.join('\n')}
"""`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que resume conversas de grupos do WhatsApp de forma clara, breve e amigável.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Erro ao gerar resumo com OpenAI:', error);
    return 'Desculpe, não consegui gerar o resumo hoje 😞';
  }
}
