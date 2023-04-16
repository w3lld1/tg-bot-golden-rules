import path from "path";
import { readFileSync } from "fs";
import { isDevMode } from "../utils";

const getDevTokens = (): { telegram: string, openAi: string } => {
  const devTokensPath = path.join(__dirname, '..', '..', '..', 'bots_data', 'golden_rules', 'tokens.json');
  let telegramToken = '';
  let openAiToken = '';

  try {
    const tokensData = readFileSync(devTokensPath, 'utf-8');
    const devTokens = JSON.parse(tokensData);

    telegramToken = devTokens?.DEV_BOT_TOKEN ?? '';
    openAiToken = devTokens?.OPENAI_API_KEY ?? '';
  } catch (err) {
    console.error(`Error reading ${devTokensPath}: ${err.message}`);
  }

  return {
    telegram: telegramToken,
    openAi: openAiToken
  }
}

export const getTokens = (): { telegram: string, openAi: string } => {
  if (isDevMode()) {
    return getDevTokens();
  }

  if (process.env.BOT_TOKEN === '') {
    console.error('Error: BOT_TOKEN is missing in .env file');
    process.exit(1);
  }

  if (process.env.OPENAI_API_KEY === '') {
    console.error('Error: OPENAI_API_KEY is missing in .env file');
    process.exit(1);
  }

  return {
    telegram: process.env.BOT_TOKEN,
    openAi: process.env.OPENAI_API_KEY,
  }
}