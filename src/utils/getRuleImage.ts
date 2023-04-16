import { getConfigs } from "../configs";
import {generateOpenAiImage} from "../api/openai";

export const getRuleImage = async (ctx: any, enteredPrompt = ''): Promise<string | null> => {
  const chatId = ctx.chat.id;
  let currentConfigs = getConfigs(chatId);
  const prompt = enteredPrompt || currentConfigs.picturePrompt || currentConfigs.defaultPicturePrompt;

  try {
    return await generateOpenAiImage(prompt);
  } catch (error) {
    console.error(error)
  }

  return null;
}