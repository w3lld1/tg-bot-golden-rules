import {Context} from "telegraf";

import {isDevMode} from "./isDevMode";
import {isNightMode} from "./isNightMode";
import {clearCurrentInterval, setIntervalId} from "../configs";
import {sendRule} from "./sendRule";

export const startSendingRules = async (ctx: Context, intervalMinutes) => {
  const chatId = ctx.chat.id;

  clearCurrentInterval(chatId);

  const intervalId = setInterval(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Не отправлять правила с 22:00 до 08:00
    if (isDevMode() || !isNightMode(chatId) || (currentHour >= 8 && currentHour < 22)) {
      sendRule(ctx);
    }
  }, intervalMinutes * 60 * 1000);

  setIntervalId(chatId, intervalId);
}