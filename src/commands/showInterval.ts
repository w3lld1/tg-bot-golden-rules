import {getConfigs} from "../configs";

export const showInterval = (ctx) => {
  const chatId = ctx.chat.id;
  const currentConfigs = getConfigs(chatId);
  let currentInterval = currentConfigs.interval;

  ctx.reply(`Интервал установлен на ${currentInterval} минут.`);
};