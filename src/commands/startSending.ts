import { isUserAdmin } from "../utils";
import { getConfigs } from "../configs";
import { sendRule } from "../utils/sendRule";
import { startSendingRules } from "../utils/startSendingRules";

export const startSending = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const chatId = ctx.chat.id;
    let currentConfigs = getConfigs(chatId);
    let currentInterval = currentConfigs.interval;

    sendRule(ctx);
    startSendingRules(ctx, currentInterval);
    ctx.reply(`Отправка правил начата с интервалом в ${currentInterval} минут.`);
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};