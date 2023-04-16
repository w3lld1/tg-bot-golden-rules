import {isUserAdmin, updateRules} from "../utils";

export const deleteRule = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const index = parseInt(ctx.message.text.split(' ')[1]) - 1;
    const chatId = ctx.chat.id;

    try {
      updateRules(chatId, 'DELETE', { index });
      ctx.reply(`Правило номер ${index + 1} удалено.`);
    } catch (error) {
      ctx.reply(error);
    }
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};