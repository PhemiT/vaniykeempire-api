require('dotenv').config();  // ← moved to top, before anything reads process.env

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const DocChunk = require('./docChunk.model');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DOCS_DIR = path.join(__dirname, 'docs');
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

async function embed(text) {
  const result = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  return result.embeddings[0].values;
}

async function ingestAll() {
  const files = fs.readdirSync(DOCS_DIR).filter(f => /\.(md|txt)$/.test(f));

  await DocChunk.deleteMany({});

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    const chunks = chunkText(raw);

    console.log(`Ingesting ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embed(chunks[i]);
      await DocChunk.create({
        text: chunks[i],
        embedding,
        source: file,
        link: inferLink(file),
        chunkIndex: i,
      });
    }
  }

  console.log('Ingestion complete.');
}

function inferLink(filename) {
  const slug = filename.replace(/\.(md|txt)$/, '');
  return `https://vaniykeempire.com/${slug}`;
}

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(ingestAll)
    .then(() => mongoose.disconnect())
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { ingestAll };