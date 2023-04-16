import {generateOpenAiImage} from "../api";

export const generatePicture = async (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');
  let pictureUrl = '';

  if (prompt) {
    try {
      pictureUrl = await generateOpenAiImage(prompt);
    } catch (e) {
      ctx.reply("Ошибка при генерации картинки");
    }

    if (pictureUrl) {
      await ctx.replyWithPhoto(pictureUrl)
    }
  } else {
    ctx.reply("Введите промпт для генерации картинки. /generate_picture <prompt>")
  }
};