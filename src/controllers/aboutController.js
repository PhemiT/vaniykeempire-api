const AboutPage = require('../models/AboutPage_');

const DEFAULTS = {
  eyebrow: 'The Man Behind The Empire',
  heroTitle: 'Van Iyke',
  heroSubtitle: 'Tech · Music · Empire',
  heroBio: 'A Tech/Music Entrepreneur loved for his unique looks, signature sound, and energetic performances. His music blends creativity across different styles to create songs that connect deeply with people — while his technology background empowers an entire generation to build the future.',
  stats: [
    { value: '5+', label: 'Years in Tech' },
    { value: '∞',  label: 'Creative Output' },
    { value: '2×', label: 'Music & Tech Mastery' },
    { value: '1',  label: 'Empire — Many Voices' },
  ],
  pillars: [
    {
      number: '01',
      label:  'The Artist',
      body:   'Known for his unique looks, signature sound, and energetic performances, Van Iyke blends creativity across genres to create music that connects deeply — not just to the ear, but to the soul.',
    },
    {
      number: '02',
      label:  'The Technologist',
      body:   'With over half a decade in the tech industry working with multinational companies, Van Iyke brings real-world technology expertise to everything he builds — bridging the gap between art and industry.',
    },
    {
      number: '03',
      label:  'The Mentor',
      body:   'Passionate about human growth, he guides individuals with little or no tech background into the industry — helping them build recurring income through digital skills and structured guidance.',
    },
    {
      number: '04',
      label:  'The Founder',
      body:   'As founder of Van Iyke Music Empire, he is building a platform dedicated to discovering talent, developing creators, and empowering the next generation to thrive in both music and technology.',
    },
  ],
  closingQuote: 'Building a platform dedicated to discovering talent, developing creators, and empowering the next generation to succeed in both music and technology.',
};

// ─── Public: Get About page content ───────────────────────────────────────
exports.getAbout = async (req, res) => {
  try {
    const doc = await AboutPage.findOne();
    if (!doc) return res.json({ about: DEFAULTS });
    res.json({ about: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Replace full About document ───────────────────────────────────
exports.putAbout = async (req, res) => {
  try {
    const { eyebrow, heroTitle, heroSubtitle, heroBio, stats, pillars, closingQuote } = req.body;

    const doc = await AboutPage.findOneAndUpdate(
      {},
      { eyebrow, heroTitle, heroSubtitle, heroBio, stats, pillars, closingQuote, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'About page updated', about: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin: Partial update ────────────────────────────────────────────────
exports.patchAbout = async (req, res) => {
  try {
    const allowedFields = ['eyebrow', 'heroTitle', 'heroSubtitle', 'heroBio', 'stats', 'pillars', 'closingQuote'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = new Date();

    const doc = await AboutPage.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'About page updated', about: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};