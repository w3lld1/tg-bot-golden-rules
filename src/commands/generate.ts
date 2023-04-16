import { generateOpenAiText } from "../api";

export const generate = async (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');

  if (prompt) {
    try {
      const generatedText = await generateOpenAiText(prompt);
      ctx.reply(generatedText);
    } catch (error) {
      ctx.reply("Произошла ошибка при генерации ответа");
    }
  } else {
    ctx.reply("Usage: /generate <prompt>");
  }
};