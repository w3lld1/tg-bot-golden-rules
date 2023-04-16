import {generateOpenAiText} from "../api";

export const getRuleText = async (rule: string) => {
  const prompt = `Напиши очень эмоциональный мотивационный текст для фразы "${rule}". В ответ пришли только сам текста на русском языке одной строкой. Текст должен быть длиной не более 1000 символов`;

  try {
    return await generateOpenAiText(prompt);
  } catch (error) {
    console.log(error);
  }

  return null;
}