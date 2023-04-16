import {updateConfigs} from "../utils";

export const setDefaultPicturePrompt = (ctx) => {
  const chatId = ctx.chat.id;

  updateConfigs(chatId, 'picturePrompt', '');
  ctx.reply('Установлен дефолтный промпт для генерации картинок');
};