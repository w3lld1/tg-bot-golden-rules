import { isUserAdmin } from "../utils";
import {clearCurrentInterval, deleteCurrentInterval, isIntervalExist} from "../configs";

export const stop = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const chatId = ctx.chat.id;

    if (isIntervalExist(chatId)) {
      clearCurrentInterval(chatId);
      deleteCurrentInterval(chatId);
      ctx.reply('Отправка правил остановлена.');
    } else {
      ctx.reply('Отправка правил не была запущена.');
    }
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};