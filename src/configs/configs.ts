import { isDevMode } from "../utils";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Configs } from "../types";

const CONFIGS_FILE = isDevMode() ? path.join(__dirname, '..', '..', '..', 'bots_data', 'golden_rules', 'configs.json') : path.join(__dirname, '..', '..', '..', 'bots_data', 'golden_rules', 'configs.json')
let configs: Record<string, Configs>;

export function initBotConfigs() {
  try {
    const configsData = readFileSync(CONFIGS_FILE, 'utf-8');
    configs = JSON.parse(configsData);
  } catch (err) {
    console.error(`Error reading ${CONFIGS_FILE}: ${err.message}`);
  }
}

export function setDefaultConfigs(chatId) {
  configs[chatId] = { ...configs.default }
}

export function getConfigs(chatId): Configs {
  if (!configs[chatId]) {
    setDefaultConfigs(chatId);
  }

  return configs[chatId];
}

export function saveConfigs(chatId, newConfig: Configs) {
  configs[chatId] = newConfig;

  try {
    writeFileSync(CONFIGS_FILE, JSON.stringify(configs));
  } catch (err) {
    console.error(`Error writing to ${CONFIGS_FILE}: ${err.message}`);
  }
}
