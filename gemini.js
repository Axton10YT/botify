const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getGeminiResponse(message, personality = "friendly AI") {
  const result = await model.generateContent([
    { role: "system", parts: [{ text: `You are a ${personality}` }] },
    { role: "user", parts: [{ text: message }] }
  ]);
  return result.response.text();
}

module.exports = getGeminiResponse;
