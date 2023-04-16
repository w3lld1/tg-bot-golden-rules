import { getRules, saveRules } from "../configs";

type Action = 'DELETE' | 'ADD' | 'EDIT';

interface Params {
  index?: number;
  value?: string;
}

const deleteRule = (rules: string[], { index }: Params): string[] => {
  if (!index) {
    throw new Error('Индекc не может быть пустым.');
  }

  if (index >= 0 && index < rules.length) {
    rules.splice(index, 1);
  } else {
    throw new Error('Неправильный индекс. Используйте /show_rules, чтобы увидеть все правила.');
  }

  return rules;
}

const editRule = (rules: string[], { index, value }: Params): string[] => {
  if (!index || !value?.trim()) {
    throw new Error('Индекс или правило не могут быть пустыми');
  }

  if (index >= 0 && index < rules.length) {
    rules[index] = value;
  }

  return rules;
}

const addRule = (rules: string[], { value }: Params): string[] => {
  if (!value?.trim()) {
    throw new Error('Нельзя добавить правило с пустым значением');
  }

  rules.push(value);

  return rules;
}

const actionHandlers: Record<Action, (rules: string[], params: Params) => string[]> = {
  'DELETE': deleteRule,
  'EDIT': editRule,
  'ADD': addRule,
}

export const updateRules = (chatId: number, action: Action, params: Params) => {
  const rules = getRules(chatId);
  const newRules = actionHandlers[action](rules, params);

  saveRules(chatId, newRules);
}