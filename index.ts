import express from 'express';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { Configuration, OpenAIApi } from 'openai'

config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const RULES_FILE = 'rules.json';
const CONFIGS_FILE = 'configs.json';
const authors = ['Джейсон Стейтем', "Альберт Эйнштейн", "Конфуций", "Виталий Кличко", "Жак Фреско", "Гордый волк", "Гитлер", "Владимир Владимирович Путин", "Ельцин", "Джо Байден"];
let rules: string[] = [];
let ruleIndex = 0;
let configs;

try {
  const configsData = readFileSync(CONFIGS_FILE, 'utf-8');
  configs = JSON.parse(configsData);
} catch (err) {
  console.error(`Error reading ${CONFIGS_FILE}: ${err.message}`);
}

let currentInterval = configs.interval;

try {
  const rulesData = readFileSync(RULES_FILE, 'utf-8');
  rules = JSON.parse(rulesData);
} catch (err) {
  console.error(`Error reading ${RULES_FILE}: ${err.message}`);
}

if (BOT_TOKEN === '') {
  console.error('Error: BOT_TOKEN is missing in .env file');
  process.exit(1);
}

if (OPENAI_API_KEY === '') {
  console.error('Error: OPENAI_API_KEY is missing in .env file');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const app = express();

app.get('/', (_, res) => {
  res.send('The bot is running!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Я бот, который будет присылать "золотые правила" в группу. Для администрирования используйте команды /add_rule, /edit_rule, /show_rules, /delete_rule и /set_interval.');
});

bot.onText(/\/add_rule (.+)/, (msg, match) => {
  const rule = match[1];
  rules.push(rule);

  try {
    writeFileSync(RULES_FILE, JSON.stringify(rules));
    // Send success message to the chat.
  } catch (err) {
    console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
    bot.sendMessage(msg.chat.id, 'Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
  }

  bot.sendMessage(msg.chat.id, `Новое правило "${rule}" добавлено.`);
});

bot.onText(/\/edit_rule (\d+) (.+)/, (msg, match) => {
  const index = parseInt(match[1]) - 1;
  const newText = match[2];

  if (index >= 0 && index < rules.length) {
    rules[index] = newText;
    try {
      writeFileSync(RULES_FILE, JSON.stringify(rules));
      // Send success message to the chat.
    } catch (err) {
      console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
      bot.sendMessage(msg.chat.id, 'Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
    }
    bot.sendMessage(msg.chat.id, `Правило номер ${index + 1} изменено на "${newText}".`);
  } else {
    bot.sendMessage(msg.chat.id, 'Неправильный индекс. Используйте /show_rules, чтобы увидеть все правила.');
  }
});

bot.onText(/\/delete_rule (\d+)/, (msg, match) => {
  const index = parseInt(match[1]) - 1;

  if (index >= 0 && index < rules.length) {
    rules.splice(index, 1);
    try {
      writeFileSync(RULES_FILE, JSON.stringify(rules));
      // Send success message to the chat.
    } catch (err) {
      console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
      bot.sendMessage(msg.chat.id, 'Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
    }
    bot.sendMessage(msg.chat.id, `Правило номер ${index + 1} удалено.`);
  } else {
    bot.sendMessage(msg.chat.id, 'Неправильный индекс. Используйте /show_rules, чтобы увидеть все правила.');
  }
});

bot.onText(/\/help/, (msg) => {
  const response = [
    'Доступные команды:',
    '/start_sending - начать отправку цитат',
    '/add_rule <текст> - добавить новое правило',
    '/show_rules - показать пронумерованный список правил',
    '/edit_rule <индекс> <текст> - изменить существующее правило',
    '/delete_rule <индекс> - удалить существующее правило',
    '/set_interval <минуты> - установить интервал для отправки правил',
    '/help - показать список команд'
  ].join('\n');

  bot.sendMessage(msg.chat.id, response);
});

let intervalId: NodeJS.Timeout;

bot.onText(/\/stop/, (msg) => {
  if (intervalId) {
    clearInterval(intervalId);
    bot.sendMessage(msg.chat.id, 'Отправка правил остановлена.');
  } else {
    bot.sendMessage(msg.chat.id, 'Отправка правил не была запущена.');
  }
});


bot.onText(/\/show_rules/, (msg) => {
  const response = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');
  bot.sendMessage(msg.chat.id, response || 'Нет правил.');
});

// Create a new command to start sending quotes with the default interval
bot.onText(/\/start_sending/, (msg) => {
  sendRule(msg.chat.id);
  startSendingRules(msg.chat.id, currentInterval);
  bot.sendMessage(msg.chat.id, `Отправка правил начата с интервалом в ${currentInterval} минут.`);
});

bot.onText(/\/set_interval (\d+)/, (msg, match) => {
  const intervalMinutes = parseInt(match[1]);

  if (intervalMinutes && intervalMinutes > 0) {
    currentInterval = intervalMinutes;
    saveIntervalToConfigs(currentInterval, msg.chat.id);

    startSendingRules(msg.chat.id, currentInterval);
    bot.sendMessage(msg.chat.id, `Интервал установлен на ${currentInterval} минут.`);
  } else {
    bot.sendMessage(msg.chat.id, 'Usage: /setinterval <minutes>');
  }
});

async function stylizeText(text: string, author: string): Promise<string> {
  // const prompt = `Придумай смешную цитату в стиле мема "цитаты великих людей" от ${author} к фразе "${text}".В ответ пришли текст цитаты и автора на русском языке.`;
  const prompt = `Напиши очень эмоциональный мотивационный текст для фразы "${text}". В ответ не пиши ничего, кроме самого текста большими буквами на русском языке`;
  const completions = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 3000,
    temperature: 0.7,
    top_p: 1,
  });

  if (completions.data.choices.length === 0) {
    throw new Error('No completions generated.');
  }

  return `${text}\n\n${completions.data.choices[0].text.trim()}`;
}

async function generateImage() {
  const response = await openai.createImage({
    prompt: 'Generate an realistic image of a cat in armor with a serious facial expression, holding a sword and ready for battle, with a background that emphasizes its knightly appearance.',
    size: '512x512'
  })

  return response.data.data[0].url;
}

async function sendRule(chatId: number) {
  if (rules.length === 0) {
    bot.sendMessage(chatId, 'Нет правил.');
    return;
  }

  const rule = rules[ruleIndex];
  ruleIndex = (ruleIndex + 1) % rules.length;
  // Choose a random style
  const author = authors[Math.floor(Math.random() * authors.length)];

  try {
    const stylizedText = await stylizeText(rule, author);
    const pictureUrl = await generateImage();
    bot.sendPhoto(chatId, pictureUrl, { caption: stylizedText });
  } catch (error) {
    console.error('Error in stylizing text:', error);
    bot.sendMessage(chatId, 'Произошла ошибка при стилизации текста. Пожалуйста, попробуйте позже.');
  }
}

// Replace setInterval with a recursive function
function startSendingRules(chatId: number, intervalMinutes: number) {
  if (intervalId) {
    clearTimeout(intervalId);
  }

  intervalId = setTimeout(() => {
    sendRule(chatId);
    startSendingRules(chatId, intervalMinutes);
  }, intervalMinutes * 30 * 1000);
}

// Function to save the interval to configs.json
function saveIntervalToConfigs(interval: number, chatId: string) {
  configs.interval = interval;
  try {
    writeFileSync(CONFIGS_FILE, JSON.stringify(configs));
    // Send success message to the chat.
  } catch (err) {
    console.error(`Error writing to ${CONFIGS_FILE}: ${err.message}`);
    bot.sendMessage(chatId, 'Произошла ошибка при установке нового интервала. Пожалуйста, попробуйте позже.');
  }
}
