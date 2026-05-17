const mongoose = require('mongoose');

const aboutPageSchema = new mongoose.Schema({
  eyebrow: { type: String, required: true },
  heroTitle: { type: String, required: true },
  heroSubtitle: { type: String, required: true },
  heroBio: { type: String, required: true },
  stats: [
    {
      value: { type: String, required: true },
      label: { type: String, required: true },
    },
  ],
  pillars: [
    {
      number: { type: String, required: true },
      label: { type: String, required: true },
      body: { type: String, required: true },
    },
  ],
  closingQuote: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AboutPage', aboutPageSchema);
