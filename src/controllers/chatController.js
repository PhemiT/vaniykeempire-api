const { answerQuery } = require('../ai/query');

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 6;

// Keeps history strictly alternating, starting with a user turn and ending
// with an assistant turn (the new message is sent separately).
function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const items = raw
    .slice(-MAX_HISTORY)
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.text === 'string' &&
        m.text.trim()
    )
    .map((m) => ({ role: m.role, text: m.text.slice(0, 1000) }));

  const out = [];
  for (const m of items) {
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1] = m;
    else out.push(m);
  }
  while (out.length && out[0].role !== 'user') out.shift();
  if (out.length && out[out.length - 1].role === 'user') out.pop();
  return out;
}

// ─── Public: Handle a chat message from the website widget ───────────────
exports.postChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res
        .status(400)
        .json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
    }

    const { text, links } = await answerQuery(message.trim(), cleanHistory(history));
    res.json({ text, links });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};