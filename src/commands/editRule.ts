import {isUserAdmin, updateRules} from "../utils";

export const editRule = async (ctx) => {
  if (await isUserAdmin(ctx)) {
    const commandParts = ctx.message.text.split(' ').slice(1);
    const chatId = ctx.chat.id;
    const index = parseInt(commandParts[0]) - 1;
    const newText = commandParts.slice(1).join(' ');

    try {
      updateRules(chatId, 'EDIT', {index, value: newText})
      ctx.reply(`Правило номер ${index + 1} изменено на "${newText}".`);
    } catch (error) {
      ctx.reply(error);
    }
  } else {
    ctx.reply('У вас нет прав администратора для выполнения этой команды.');
  }
};