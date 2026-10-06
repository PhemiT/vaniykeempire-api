const { answerQuery } = require('../ai/query');

// ─── Public: Handle a chat message from the website widget ───────────────
exports.postChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const { text, links } = await answerQuery(message);
    res.json({ text, links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};