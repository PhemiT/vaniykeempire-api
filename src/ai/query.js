const { GoogleGenAI } = require('@google/genai');
const DocChunk = require('./docChunk.model');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768; // must match ingest.js and your Atlas index config
const CHAT_MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_PROMPT = `You are the customer support agent for Van Iyke Empire.
Answer using the provided context below. If the context contains relevant information,
synthesize a clear, customer-friendly answer from it — you do not need an exact word-for-word
match. Only say you don't have the information if the context truly contains nothing relevant
to the question.
Do NOT include citation markers like [1] or [2, 3] in your answer — write naturally as if
speaking directly to the customer.
When relevant, include the page link(s) provided in the context as markdown links with a short
descriptive label, e.g. [Sound Vault](https://vaniykemusicempire.com/link). Never print a raw URL.`;

async function embedQuery(text) {
  const result = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  return result.embeddings[0].values;
}

async function retrieveContext(queryEmbedding, k = 5) {
  const results = await DocChunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: k,
      },
    },
    {
      $project: {
        text: 1,
        source: 1,
        link: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);
  return results;
}

// Retries a Gemini generateContent call on transient 503 "high demand" errors.
// This is what answerQuery calls instead of hitting genAI.models.generateContent directly.
async function generateWithRetry(params, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await genAI.models.generateContent(params);
    } catch (err) {
      const is503 = err.message?.includes('UNAVAILABLE') || err.message?.includes('503');
      if (is503 && attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 1s, then 2s backoff
        continue;
      }
      throw err; // not a 503, or retries exhausted — let it surface as before
    }
  }
}

async function answerQuery(userMessage, history = []) {
    // Include the previous user turn in the retrieval query so follow-ups
    // like "how much is that one?" still find the right chunks.
    const prevUser = [...history].reverse().find((m) => m.role === 'user');
    const retrievalText = prevUser ? `${prevUser.text}\n${userMessage}` : userMessage;
  
    const queryEmbedding = await embedQuery(retrievalText);
    const contextChunks = await retrieveContext(queryEmbedding);
  
    const contextBlock = contextChunks
    .map((c, i) => `[${i + 1}]${c.link ? ` (page: ${c.link})` : ''}\n${c.text}`)
    .join('\n\n');
  
    const result = await generateWithRetry({
      model: CHAT_MODEL,
      config: { systemInstruction: SYSTEM_PROMPT },
      contents: [
        ...history.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        {
          role: 'user',
          parts: [{ text: `Context:\n${contextBlock}\n\nQuestion: ${userMessage}` }],
        },
      ],
    });
  
    const links = [
      ...new Set(contextChunks.map((c) => c.link).filter(Boolean)),
    ].slice(0, 2); 
    return { text: result.text, links };
}

module.exports = { answerQuery };