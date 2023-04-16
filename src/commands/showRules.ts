import { getRules } from "../configs";

export const showRules = (ctx) => {
    const chatId = ctx.chat.id;
    const currentRules = getRules(chatId);
    const response = currentRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

    ctx.reply(response || 'Нет правил.');
};