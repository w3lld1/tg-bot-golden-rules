import {isUserAdmin, updateConfigs} from "../utils";

export const setSendingInterval = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const chatId = ctx.chat.id;
    const intervalMinutes = parseInt(ctx.message.text.split(' ')[1]);

    if (intervalMinutes && intervalMinutes > 0) {
      updateConfigs(chatId, 'interval', intervalMinutes)
      ctx.reply(`Интервал установлен на ${intervalMinutes} минут.`);
    } else {
      ctx.reply('Usage: /set_interval <minutes>');
    }
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};