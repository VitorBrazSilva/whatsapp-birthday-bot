import OpenAI from "openai";

export async function gerarMensagem(nome, descricao) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ move para dentro

  const prompt = `Crie uma mensagem de parabéns para ${nome}, que ${descricao}`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}