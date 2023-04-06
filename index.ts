import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Telegraf } from 'telegraf';
import { Configuration, OpenAIApi } from 'openai';

config();

const isDev = process.env.NODE_ENV === 'development';
const DEV_TOKENS = isDev ? path.join(__dirname, '..', 'bots_data', 'golden_rules', 'tokens.json') : '';
let devBotToken = '';
let devOpenAiKey = '';

if (isDev) {
  try {
    const tokensData = readFileSync(DEV_TOKENS, 'utf-8');
    const devTokens = JSON.parse(tokensData);
    devBotToken = devTokens?.BOT_TOKEN ?? '';
    devOpenAiKey = devTokens?.OPENAI_API_KEY ?? '';
  } catch (err) {
    console.error(`Error reading ${DEV_TOKENS}: ${err.message}`);
  }
}

const BOT_TOKEN = isDev ? devBotToken : (process.env.BOT_TOKEN ?? '');
const OPENAI_API_KEY = isDev ? devOpenAiKey : (process.env.OPENAI_API_KEY ?? '');
const bot = new Telegraf(BOT_TOKEN);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const RULES_FILE = isDev ? path.join(__dirname, '..', 'bots_data', 'golden_rules', 'rules.json') : path.join(__dirname, '..', '..', 'bots_data', 'golden_rules', 'rules.json')
const CONFIGS_FILE = isDev ? path.join(__dirname, '..', 'bots_data', 'golden_rules', 'configs.json') : path.join(__dirname, '..', '..', 'bots_data', 'golden_rules', 'configs.json')
const intervalsIds = new Map();
let ruleIndex = 0;
let rules: Record<string, string[]>;
let configs: Record<string, { interval: number , picturePrompt: string, defaultPicturePrompt: string }>;

try {
  const configsData = readFileSync(CONFIGS_FILE, 'utf-8');
  configs = JSON.parse(configsData);
} catch (err) {
  console.error(`Error reading ${CONFIGS_FILE}: ${err.message}`);
}

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

bot.command('start', (ctx) => {
  const chatId = ctx.chat.id;

  if (!configs[chatId]) {
    configs[chatId] = configs.default;
  }

  if (!rules[chatId]) {
    rules[chatId] = rules.default;
  }

  ctx.reply('Привет! Я бот, который будет присылать "золотые правила" в группу. Для просмотра списка команд, напишите /help');
});

bot.command('add_rule', (ctx) => {
  const rule = ctx.message.text.split(' ').slice(1).join(' ');
  const chatId = ctx.chat.id;

  rules[chatId] = [...rules[chatId], rule];

  try {
    writeFileSync(RULES_FILE, JSON.stringify(rules));
    // Send success message to the chat.
  } catch (err) {
    console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
    ctx.reply('Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
  }

  ctx.reply(`Новое правило "${rule}" добавлено.`);
});

bot.command('edit_rule', (ctx) => {
  const commandParts = ctx.message.text.split(' ').slice(1);
  const chatId = ctx.chat.id;
  const index = parseInt(commandParts[0]) - 1;
  const newText = commandParts.slice(1).join(' ');
  const currentRules = rules[chatId] ?? rules.default;

  if (index >= 0 && index < currentRules.length) {
    currentRules[index] = newText;
    try {
      rules = { ...rules, [chatId]: currentRules };
      writeFileSync(RULES_FILE, JSON.stringify(rules));
      // Send success message to the chat.
    } catch (err) {
      console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
      ctx.reply('Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
    }
    ctx.reply(`Правило номер ${index + 1} изменено на "${newText}".`);
  } else {
    ctx.reply('Неправильный индекс. Используйте /show_rules, чтобы увидеть все правила.');
  }
});

bot.command('delete_rule', (ctx) => {
  const index = parseInt(ctx.message.text.split(' ')[1]) - 1;
  const chatId = ctx.chat.id;
  const currentRules = rules[chatId] ?? rules.default;

  if (index >= 0 && index < currentRules.length) {
    currentRules.splice(index, 1);
    try {
      rules = { ...rules, [chatId]: currentRules };
      writeFileSync(RULES_FILE, JSON.stringify(rules));
      // Send success message to the chat.
    } catch (err) {
      console.error(`Error writing to ${RULES_FILE}: ${err.message}`);
      ctx.reply('Произошла ошибка при обновлении правил. Пожалуйста, попробуйте позже.');
    }
    ctx.reply(`Правило номер ${index + 1} удалено.`);
  } else {
    ctx.reply('Неправильный индекс. Используйте /show_rules, чтобы увидеть все правила.');
  }
});

bot.command('help', (ctx) => {
  const response = [
    'Доступные команды:',
    '/start_sending - начать отправку цитат',
    '/add_rule <текст> - добавить новое правило',
    '/show_rules - показать пронумерованный список правил',
    '/edit_rule <индекс> <текст> - изменить существующее правило',
    '/delete_rule <индекс> - удалить существующее правило',
    '/set_interval <минуты> - установить интервал для отправки правил',
    '/show_interval - показать текущее установленное значение интервала',
    '/change_picture_prompt <prompt> - изменить промпт для генерации изображения',
    '/set_default_prompt - установить дефолтный промпт для генерации изображения',
    '/generate_picture <prompt> - сгенерировать картинку по промпту',
    '/help - показать список команд'
  ].join('\n');

  ctx.reply(response);
});

bot.command('stop', (ctx) => {
  const chatId = ctx.chat.id;

  if (intervalsIds.has(chatId)) {
    clearInterval(intervalsIds.get(chatId));
    intervalsIds.delete(chatId);
    ctx.reply('Отправка правил остановлена.');
  } else {
    ctx.reply('Отправка правил не была запущена.');
  }
});

bot.command('show_rules', (ctx) => {
  const chatId = ctx.chat.id;
  const currentRules = rules[chatId] ?? rules.default;
  const response = currentRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');
  ctx.reply(response || 'Нет правил.');
});

// Create a new command to start sending quotes with the default interval
bot.command('start_sending', (ctx) => {
  const chatId = ctx.chat.id
  let currentInterval = configs[chatId]?.interval ?? configs.default.interval;

  sendRule(ctx);
  startSendingRules(ctx, currentInterval);
  ctx.reply(`Отправка правил начата с интервалом в ${currentInterval} минут.`);
});

bot.command('set_interval', (ctx) => {
  const intervalMinutes = parseInt(ctx.message.text.split(' ')[1]);
  let currentInterval = configs[ctx.chat.id]?.interval ?? configs.default.interval;

  if (intervalMinutes && intervalMinutes > 0) {
    currentInterval = intervalMinutes;
    saveIntervalToConfigs(currentInterval, ctx);

    // startSendingRules(ctx, currentInterval)
    ctx.reply(`Интервал установлен на ${currentInterval} минут.`);
  } else {
    ctx.reply('Usage: /setinterval <minutes>');
  }
});

bot.command('show_interval', (ctx) => {
  let currentInterval = configs[ctx.chat.id]?.interval ?? configs.default.interval;
  ctx.reply(`Интервал установлен на ${currentInterval} минут.`);
});

bot.command('change_picture_prompt', (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');
  const chatId = ctx.chat.id;

  if (prompt) {
    configs[chatId] = { ...configs[chatId], picturePrompt: prompt };
    try {
      writeFileSync(CONFIGS_FILE, JSON.stringify(configs));
      ctx.reply(`Промпт для картинки изменен на "${prompt}".`);
    } catch (err) {
      console.error(`Error writing to ${CONFIGS_FILE}: ${err.message}`);
      ctx.reply('Произошла ошибка при обновлении промпта для картинки. Пожалуйста, попробуйте позже.');
    }
  } else {
    ctx.reply('Usage: /change_picture_prompt <prompt>');
  }
});

bot.command('generate_picture', async (ctx) => {
  const prompt = ctx.message.text.split(' ').slice(1).join(' ');
  let pictureUrl = ''

  if (prompt) {
    try {
      pictureUrl = await generateImage(ctx, prompt);
    } catch (e) {
      ctx.reply("Ошибка при генерации картинки");
    }

    if (pictureUrl) {
      await ctx.replyWithPhoto(pictureUrl)
    }
  } else {
    ctx.reply("Введите промпт для генерации картинки. /generate_picture <prompt>")
  }
});

bot.command('set_default_prompt', (ctx) => {
    const chatId = ctx.chat.id;

    configs[chatId] = { ...configs[chatId], picturePrompt: "" };

    try {
      writeFileSync(CONFIGS_FILE, JSON.stringify(configs));
      ctx.reply(`Промпт для картинки изменен на дефолтный`);
    } catch (err) {
      console.error(`Error writing to ${CONFIGS_FILE}: ${err.message}`);
      ctx.reply('Произошла ошибка при обновлении промпта для картинки. Пожалуйста, попробуйте позже.');
    }
});

async function stylizeText(text: string): Promise<string> {
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

async function generateImage(ctx, enteredPrompt = '') {
  const chatId = ctx.chat.id;
  const prompt = enteredPrompt || (configs[chatId]?.picturePrompt ?? configs.default.picturePrompt) || (configs[chatId]?.defaultPicturePrompt ?? configs.default.defaultPicturePrompt);

  const response = await openai.createImage({
    prompt,
    size: '512x512'
  })

  return response.data.data[0].url;
}

async function sendRule(ctx) {
  const chatId = ctx.chat.id;
  const currentRules = rules[chatId] ?? rules.default;

  if (currentRules.length === 0) {
    ctx.reply('Нет правил.');
    return;
  }

  const rule = currentRules[ruleIndex];
  ruleIndex = (ruleIndex + 1) % currentRules.length;

  try {
    const stylizedText = await stylizeText(rule);
    const pictureUrl = await generateImage(ctx);
    await ctx.replyWithPhoto(pictureUrl, { caption: stylizedText });
  } catch (error) {
    console.error('Error in stylizing text:', error);
    ctx.reply('Произошла ошибка при стилизации текста. Пожалуйста, попробуйте позже.');
  }
}

// Replace setInterval with a recursive function
function startSendingRules(ctx, intervalMinutes) {
  const chatId = ctx.chat.id;

  if (intervalsIds.has(chatId)) {
    clearTimeout(intervalsIds.get(chatId));
  }

  const intervalId = setTimeout(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Не отправлять правила с 22:00 до 08:00
    if (currentHour >= 22 || currentHour < 8) {
      console.log('Ночной режим активен, правила не отправляются');
    } else {
      sendRule(ctx);
    }

    startSendingRules(ctx, intervalMinutes);
  }, intervalMinutes * 60 * 1000);

  intervalsIds.set(chatId, intervalId);
}

// Function to save the interval to configs.json
function saveIntervalToConfigs(interval: number, ctx: any) {
  const chatId = ctx.chat.id;

  configs[chatId] = { ...configs[chatId], interval };

  try {
    writeFileSync(CONFIGS_FILE, JSON.stringify(configs));
    // Send success message to the chat.
  } catch (err) {
    console.error(`Error writing to ${CONFIGS_FILE}: ${err.message}`);
    ctx.reply('Произошла ошибка при установке нового интервала. Пожалуйста, попробуйте позже.');
  }
}

bot.launch();