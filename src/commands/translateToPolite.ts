import { generateOpenAiText } from "../api";

export const translateToPolite = async (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');

  if (prompt) {
    try {
      const generatedText = await generateOpenAiText(`Напиши письмо "${prompt}" в вежливом, позитивном и корпоративном стиле`);
      ctx.reply(generatedText);
    } catch (error) {
      ctx.reply("Произошла ошибка при генерации ответа");
    }
  } else {
    ctx.reply("Usage: /generate <prompt>");
  }
};