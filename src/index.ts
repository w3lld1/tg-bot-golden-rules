import { config } from 'dotenv';
import { getTokens, initBotConfigs, initBotRules, initIntervals } from "./configs";
import {
  addRule,
  deleteRule,
  editRule,
  generate,
  generatePicture,
  help, nightMode,
  setDefaultPicturePrompt,
  setSendingInterval,
  showInterval,
  showRules,
  start,
  startSending,
  stop
} from "./commands";
import {initOpenAiApi, initTelegramBot} from "./api";
import {translateToPolite} from "./commands/translateToPolite";

config();
initBotConfigs();
initBotRules();
initIntervals();
initOpenAiApi(getTokens().openAi);
const bot = initTelegramBot(getTokens().telegram);

bot.command('start', start);
bot.command('help', help);
bot.command('stop', stop);
bot.command('delete_rule', deleteRule);
bot.command('edit_rule', editRule);
bot.command('add_rule', addRule);
bot.command('show_rules', showRules);
bot.command('start_sending', startSending);
bot.command('set_interval', setSendingInterval);
bot.command('show_interval', showInterval);
bot.command('generate_picture', generatePicture);
bot.command('generate', generate);
bot.command('night_mode', nightMode);
bot.command('set_default_picture_prompt', setDefaultPicturePrompt);
bot.command('polite', translateToPolite);

bot.launch();