require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const DocChunk = require('./docChunk.model');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DOCS_DIR = path.join(__dirname, 'docs');

// Hardcoded on purpose: ingestion usually runs locally, where FRONTEND_URL is localhost.
// Change to https://www.… if that's where the site actually lives.
const SITE_URL = 'https://vaniykemusicempire.com';

const MAX_CHUNK = 900; // characters
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768; // must match query.js and the Atlas index

const toUrl = (link) =>
  !link ? null : /^https?:\/\//.test(link) ? link : SITE_URL + link;

// Splits markdown at "##" and "###" headings. A <!-- link: /path --> line under a
// heading sets that section's page; sub-sections inherit their parent's link.
function parseSections(raw) {
  const sections = [];
  const titles = ['', ''];
  const links = [null, null];
  let body = [];

  const flush = () => {
    const text = body.join('\n').trim();
    if (text) {
      sections.push({
        heading: titles.filter(Boolean).join(' > '),
        link: links[1] ?? links[0],
        text,
      });
    }
    body = [];
  };

  for (const line of raw.split(/\r?\n/)) {
    const heading = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (heading) {
      flush();
      const level = heading[1].length - 2; // 0 for ##, 1 for ###
      titles[level] = heading[2].replace(/\*\*/g, '');
      links[level] = null;
      if (level === 0) {
        titles[1] = '';
        links[1] = null;
      }
      continue;
    }

    const marker = line.match(/^<!--\s*link:\s*(\S+)\s*-->\s*$/);
    if (marker) {
      links[titles[1] ? 1 : 0] = marker[1];
      continue;
    }

    if (/^---\s*$/.test(line)) continue; // horizontal rules
    body.push(line);
  }
  flush();
  return sections;
}

function splitLines(block) {
  const out = [];
  let cur = '';
  for (const line of block.split('\n')) {
    if (cur && (cur + '\n' + line).length > MAX_CHUNK) {
      out.push(cur);
      cur = '';
    }
    cur += (cur ? '\n' : '') + line;
  }
  if (cur) out.push(cur);
  return out;
}

// Chunks stay inside one section; breaks happen at paragraph boundaries where possible.
function chunkSection(text) {
  const blocks = text
    .split(/\n{2,}/)
    .flatMap((b) => (b.length <= MAX_CHUNK ? [b] : splitLines(b)));

  const chunks = [];
  let cur = '';
  for (const block of blocks) {
    if (cur && (cur + '\n\n' + block).length > MAX_CHUNK) {
      chunks.push(cur.trim());
      cur = '';
    }
    cur += (cur ? '\n\n' : '') + block;
  }
  if (cur.trim()) chunks.push(cur.trim());
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
  const files = fs.readdirSync(DOCS_DIR).filter((f) => /\.(md|txt)$/.test(f));
  const records = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    let index = 0;

    for (const section of parseSections(raw)) {
      for (const piece of chunkSection(section.text)) {
        // The heading is part of the chunk so "Sound Vault" questions match it
        const text = section.heading ? `${section.heading}\n\n${piece}` : piece;
        records.push({
          text,
          embedding: await embed(text),
          source: file,
          link: toUrl(section.link),
          chunkIndex: index++,
        });
      }
    }
    console.log(`Prepared ${file}: ${index} chunks`);
  }

  // Only replace the old data once everything has embedded successfully,
  // so a failed run no longer leaves the bot with half a knowledge base.
  await DocChunk.deleteMany({});
  await DocChunk.insertMany(records);
  console.log(`Ingestion complete: ${records.length} chunks.`);
}

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(ingestAll)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { ingestAll };