const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 200,
  responseMimeType: "text/plain",
};

async function getAIResponse(prompt) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);

    const generatedText = await result.response.text();
    console.log('Received AI response:', generatedText);

    return generatedText;
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    throw error;
  }
}

module.exports = {
  getAIResponse,
};
