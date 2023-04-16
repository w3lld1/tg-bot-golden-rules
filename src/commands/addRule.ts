import {isUserAdmin, updateRules} from "../utils";

export const addRule = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const rule = ctx.message.text.split(' ').slice(1).join(' ');
    const chatId = ctx.chat.id;

    try {
      updateRules(chatId, 'ADD', {value: rule});
      ctx.reply(`Новое правило "${rule}" добавлено.`);
    } catch (error) {
      ctx.reply(error);
    }
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};