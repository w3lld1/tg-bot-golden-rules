import { isDevMode } from "../utils";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const RULES_FILE = isDevMode() ? path.join(__dirname, '..', '..', '..', 'bots_data', 'golden_rules', 'rules.json') : path.join(__dirname, '..', '..', '..', 'bots_data', 'golden_rules', 'rules.json')
let rules: Record<string, string[]>;
let currentRuleIndexes;

export function initBotRules(): void {
  try {
    const rulesData = readFileSync(RULES_FILE, 'utf-8');
    rules = JSON.parse(rulesData);
    currentRuleIndexes = new Map();
  } catch (err) {
    console.error(`Error reading ${RULES_FILE}: ${err.message}`);
  }
}

export function getRules(chatId): string[] {
  if (!rules[chatId]) {
    rules[chatId] = [ ...rules.default ];
  }

  return rules[chatId];
}

export function saveRules(chatId: number, newRules: string[]) {
  rules[chatId] = newRules;

  try {
    writeFileSync(RULES_FILE, JSON.stringify(rules));
  } catch (err) {
    console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
  }
}

export const getCurrentRuleIndex = (chatId: number) => currentRuleIndexes.get(chatId) || 0;

export const setCurrentRuleIndex = (chatId: number, index: number) => currentRuleIndexes.set(chatId, index);