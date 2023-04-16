import { updateConfigs } from "../utils";

export const nightMode = (ctx) => {
  const chatId = ctx.chat.id;
  const nightModeState = ctx.message?.text.split(' ').slice(1).join(' ');

  if (!nightModeState || (nightModeState !== 'ON' && nightModeState !== 'OFF')) {
    ctx.reply("Usage: /night_mode ON или /night_mode OFF");
    return;
  }

  updateConfigs(chatId, 'nightMode', nightModeState);
  ctx.reply(nightModeState === 'ON' ? "Установлен ночной режим" : "Ночной режим отключен");
};