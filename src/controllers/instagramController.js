const axios = require('axios');
const { answerQuery } = require('../ai/query');

const IG_MAX = 1000; // Instagram rejects messages over 1000 characters
const GRAPH_MESSAGES = 'https://graph.instagram.com/v21.0/me/messages';

const GREETING_RE =
  /^(hi+|hello+|hey+|heya|hiya|hola|yo|sup|howdy|greetings|good\s+(morning|afternoon|evening))(\s+(there|everyone|van iyke))?[\s!.,?]*$/i;

// Strips emojis/punctuation first, so "Hello 👋" and "hey!!" both count as greetings
const isGreeting = (text) =>
  GREETING_RE.test(
    text.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  );

const WELCOME_TEXT = `Welcome to the Empire!
I'm Van Iyke — I help everyday people break into tech (no experience needed), and I make music that feeds your soul.
We also offer all kinds of tech services: AI automation, software, cybersecurity, and more.
If you want to know more or require any of our services, please visit our website: https://www.vaniykemusicempire.com
If you followed to learn how to transition to Tech, check out our books and Tech Guides: https://www.vaniykemusicempire.com/tech-vault
If you are here for the Music, follow this link: https://www.vaniykemusicempire.com/sound-vault
If you are here for the Cinematic Videos, follow this link: https://www.vaniykemusicempire.com/empire-films
Glad you found us — stick around, there's a lot coming.`;

const LISTEN_TEXT = `Thank you for watching
I'm Van Iyke — I make music that warms your soul.
Glad you enjoyed the Sound.
You can Listen Here: https://www.vaniykemusicempire.com/sound-vault
Happy you found us — stick around, there's a lot coming.`;

const KNOW_MORE_TEXT = `Thank you for reaching out
I'm Van Iyke — we help businesses and companies grow with tech: AI automation, software, cybersecurity, and more.
We build systems that save you time, cut manual work, and protect your business.
Learn more here: https://www.vaniykemusicempire.com/tech-services
Glad you found us — stick around, there's a lot coming.`;

// Comment triggers: first match wins. \b means "start" matches, but "restart" or "starting" don't.
const COMMENT_TRIGGERS = [
  { re: /\bstart\b/i, text: WELCOME_TEXT },
  { re: /\blisten\s+now\b/i, text: LISTEN_TEXT },
  { re: /\bknow\s+more\b/i, text: KNOW_MORE_TEXT },
];

// Meta can deliver the same event more than once, so skip any id we've already handled.
// Used for both message ids (DMs) and comment ids.
const seen = new Map();
const isDuplicate = (id) => {
  if (!id) return false;
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 10 * 60 * 1000) seen.delete(k);
  if (seen.has(id)) return true;
  seen.set(id, now);
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

// ─── Public: Handle incoming Instagram events (DMs + comments) ────────────
exports.handleMessage = async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body)); // remove once stable, it logs customer messages
  res.sendStatus(200); // ack immediately, Meta expects a fast response and will retry on timeout

  try {
    for (const entry of req.body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleDm(event);
      }
      for (const change of entry.changes ?? []) {
        if (change.field === 'comments') {
          await handleComment(change.value, entry.id);
        }
      }
    }
  } catch (error) {
    console.error('Instagram webhook error:', error.message);
  }
};

// ─── DMs ──────────────────────────────────────────────────────────────────
async function handleDm(event) {
  if (!event?.message?.text || event.message.is_echo) return;
  if (isDuplicate(event.message.mid)) return;

  try {
    const senderId = event.sender.id;
    const incoming = event.message.text.trim();
    const text = isGreeting(incoming)
      ? WELCOME_TEXT
      : (await answerQuery(incoming)).text;

    await sendInstagramReply(senderId, text);
  } catch (error) {
    console.error('Failed to handle DM:', error.response?.data || error.message);
  }
}

// ─── Comments: a trigger word in a comment gets its matching message as a private reply ──
async function handleComment(value, accountId) {
  const commentId = value?.id;
  const text = (value?.text || '').trim();
  if (!commentId || !text) return;
  if (value?.from?.id === accountId) return; // never reply to our own comments

  const trigger = COMMENT_TRIGGERS.find((t) => t.re.test(text));
  if (!trigger) return;
  if (isDuplicate(commentId)) return;

  try {
    await axios.post(
      GRAPH_MESSAGES,
      {
        recipient: { comment_id: commentId },
        message: { text: toInstagramText(trigger.text) },
      },
      { params: { access_token: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN } }
    );
  } catch (error) {
    console.error('Private reply failed:', error.response?.data || error.message);
  }
}

// ─── Internal: Instagram DMs are plain text, so strip the markdown Gemini writes ──
function toInstagramText(md) {
  return md
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1: $2') // [label](url) -> label: url
    .replace(/\*\*(.+?)\*\*/g, '$1')                            // **bold**
    .replace(/^[ \t]*[*-][ \t]+/gm, '• ')                       // "* item" -> "• item"
    .replace(/\*(.+?)\*/g, '$1')                                // *italic*
    .replace(/^#{1,6}[ \t]+/gm, '')                             // # headings
    .replace(/[ \t]+$/gm, '')                                   // trailing spaces
    .replace(/\n+/g, '\n\n')                                    // one blank line between every line
    .trim();
}

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
  for (const part of splitForInstagram(toInstagramText(text))) {
    await axios.post(
      GRAPH_MESSAGES,
      { recipient: { id: recipientId }, message: { text: part } },
      { params: { access_token: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN } }
    );
  }
}