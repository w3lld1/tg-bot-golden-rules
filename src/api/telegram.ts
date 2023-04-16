import {Telegraf} from "telegraf";

export const initTelegramBot = (botToken: string) => {
  if (!botToken) {
    throw new Error('Не установлен токен телеграм бота');
  }

  const bot = new Telegraf(botToken);

  return bot;
}