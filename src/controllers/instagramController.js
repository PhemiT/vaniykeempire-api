const axios = require('axios');
const { answerQuery } = require('../ai/query');

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

    const senderId = entry.sender.id;
    const { text } = await answerQuery(entry.message.text);

    try {
      await sendInstagramReply(senderId, text);
    } catch (sendError) {
      console.error('Failed to send Instagram reply:', sendError.response?.data || sendError.message);
    }
  } catch (error) {
    console.error('Instagram webhook error:', error.message);
  }
};

// ─── Internal: Send a reply via Meta Graph API ────────────────────────────
async function sendInstagramReply(recipientId, text) {
  await axios.post(
    'https://graph.instagram.com/v21.0/me/messages',
    { recipient: { id: recipientId }, message: { text } },
    { params: { access_token: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN } }
  );
}