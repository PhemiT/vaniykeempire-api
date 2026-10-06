require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

console.log('Key loaded:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 8) + '...' : 'UNDEFINED');  // ← add here

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testChat() {
  const result = await genAI.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: 'Say "API key works" and nothing else.',
  });
  console.log('Chat test:', result.text);
}

async function testEmbedding() {
    const result = await genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: 'test sentence',
      config: { outputDimensionality: 768 },  
    });
    console.log('Embedding test: vector length =', result.embeddings[0].values.length);
}

async function main() {
  try {
    await testChat();
    await testEmbedding();
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

main();