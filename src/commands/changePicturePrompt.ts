import {updateConfigs} from "../utils";

export const changePicturePrompt = (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');
  const chatId = ctx.chat.id;

  if (prompt) {
    updateConfigs(chatId, 'picturePrompt', prompt);
  } else {
    ctx.reply('Usage: /change_picture_prompt <prompt>');
  }
};