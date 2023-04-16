import {Context} from "telegraf";

import { getCurrentRuleIndex, getRules, setCurrentRuleIndex } from "../configs";
import { getRuleText } from "./getRuleText";
import { getRuleImage } from "./getRuleImage";

export const sendRule = async (ctx: Context) => {
  const chatId = ctx.chat.id;
  const currentRules = getRules(chatId);

  if (currentRules.length === 0) {
    ctx.reply('Нет правил.');
    return;
  }
  const currentRuleIndex = getCurrentRuleIndex(chatId);
  const rule = currentRules[currentRuleIndex];
  setCurrentRuleIndex(chatId, (currentRuleIndex + 1) % currentRules.length)

  try {
    const generatedText = await getRuleText(rule);
    const generatedImageUrl = await getRuleImage(ctx);

    if (generatedImageUrl) {
      await ctx.replyWithPhoto(generatedImageUrl);
    }

    if (generatedText) {
      ctx.reply(`"${rule}"\n\n${generatedText}`);
    }
  } catch (error) {
    console.log(error);
    ctx.reply('Произошла ошибка');
  }
}