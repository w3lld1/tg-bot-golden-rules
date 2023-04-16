import {Configuration, OpenAIApi} from "openai";

let openai;

export const initOpenAiApi = (apiKey) => {
  const configuration = new Configuration({
    apiKey,
  });

  openai = new OpenAIApi(configuration);
}

export const generateOpenAiText = async (prompt) => {
  const completions = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "user", content: prompt}
    ],
    temperature: 0.7,
    top_p: 1,
  });

  if (!completions?.data?.choices?.[0]?.message?.content) {
    throw new Error('Нет сгенерированных ответов');
  }

  return completions.data.choices[0].message.content;
}

export const generateOpenAiImage = async (prompt) => {
  const response = await openai.createImage({
    prompt,
    n: 1,
    size: '512x512'
  })

  if (!response?.data?.data?.[0]?.url) {
    throw new Error('Нет сгенерированных ответов');
  }

  return response.data.data[0].url;
}
