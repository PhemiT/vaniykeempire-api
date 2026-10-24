const axios = require('axios');
const { answerQuery } = require('../ai/query');

const IG_MAX = 1000; // Instagram rejects messages over 1000 characters

const GREETING_RE =
  /^(hi+|hello+|hey+|heya|hiya|hola|yo|sup|howdy|greetings|good\s+(morning|afternoon|evening))(\s+(there|everyone|van iyke))?[\s!.,?]*$/i;

const WELCOME_TEXT = `Welcome to the Empire
I'm Van Iyke — I help everyday people break into tech (no experience needed), and I make music that feeds your soul.
We also offer all kinds of tech services: AI automation, software, cybersecurity, and more. If you want to know more or require any of our services, please visit our website: https://www.vaniykemusicempire.com
If you followed to learn how to transition to Tech, check out our books and Tech Guides: https://www.vaniykemusicempire.com/tech-vault
If you are here for the Music and Cinematic Videos, follow this link: https://www.vaniykemusicempire.com/sound-vault
Glad you found us — stick around, there's a lot coming.`;

// Meta can deliver the same message more than once, so skip any mid we've already handled.
const seen = new Map();
const isDuplicate = (mid) => {
  if (!mid) return false;
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 10 * 60 * 1000) seen.delete(k);
  if (seen.has(mid)) return true;
  seen.set(mid, now);
  return false;
};

// ─── Public: Meta webhook verification ────────────────────────────────────
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// ─── Public: Handle incoming Instagram DMs ────────────────────────────────
exports.handleMessage = async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body));
  res.sendStatus(200); // ack immediately — Meta expects a fast response and will retry on timeout

  try {
    const entry = req.body.entry?.[0]?.messaging?.[0];
    if (!entry?.message?.text || entry.message.is_echo) return;
    if (isDuplicate(entry.message.mid)) return;

    const senderId = entry.sender.id;
    const incoming = entry.message.text.trim();
    const text = GREETING_RE.test(incoming)
      ? WELCOME_TEXT
      : (await answerQuery(incoming)).text;

    try {
      await sendInstagramReply(senderId, text);
    } catch (sendError) {
      console.error('Failed to send Instagram reply:', sendError.response?.data || sendError.message);
    }
  } catch (error) {
    console.error('Instagram webhook error:', error.message);
  }
};

// ─── Internal: Split long replies to fit Instagram's 1000-character limit ──
function splitForInstagram(text) {
  const parts = [];
  let rest = text.trim();
  while (rest.length > IG_MAX) {
    let cut = rest.lastIndexOf('\n', IG_MAX);
    if (cut < IG_MAX / 2) cut = rest.lastIndexOf(' ', IG_MAX);
    if (cut < IG_MAX / 2) cut = IG_MAX;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

// ─── Internal: Send a reply via Meta Graph API ────────────────────────────
async function sendInstagramReply(recipientId, text) {
  for (const part of splitForInstagram(text)) {
    await axios.post(
      'https://graph.instagram.com/v21.0/me/messages',
      { recipient: { id: recipientId }, message: { text: part } },
      { params: { access_token: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN } }
    );
  }
}