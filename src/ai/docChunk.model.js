const mongoose = require('mongoose');

const docChunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // 1536 dims for text-embedding-3-small
  source: { type: String, required: true },       // filename or URL
  link: { type: String },                          // page URL to cite back to user
  chunkIndex: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('DocChunk', docChunkSchema);