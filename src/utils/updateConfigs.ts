import {getConfigs, saveConfigs} from "../configs";
import {Configs} from "../types";

export const updateConfigs = (chatId: number, field: keyof Configs, newValue: unknown) => {
  const configs = getConfigs(chatId);
  saveConfigs(chatId, { ...configs, [field]: newValue })
}