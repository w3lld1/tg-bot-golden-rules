import {getConfigs} from "../configs";

export const isNightMode = (chatId: number): boolean => {
  const configs = getConfigs(chatId);

  return configs?.nightMode === 'ON';
}