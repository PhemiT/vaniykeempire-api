const axios = require('axios');

const FALLBACK_RATE = Number(process.env.USD_TO_NGN_FALLBACK_RATE) || 1350;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedRate = null;
let cachedAt = 0;

const fetchLiveRate = async () => {
  const res = await axios.get('https://open.er-api.com/v6/latest/USD');
  const rate = res.data?.rates?.NGN;
  if (!rate || typeof rate !== 'number') {
    throw new Error('NGN rate missing from FX API response');
  }
  return rate;
};

const getUsdToNgnRate = async () => {
  const now = Date.now();
  if (cachedRate && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }

  try {
    const liveRate = await fetchLiveRate();
    cachedRate = liveRate;
    cachedAt = now;
    return liveRate;
  } catch (err) {
    console.error('FX rate fetch failed, using fallback:', err.message);
    // Serve a stale cached rate over the hardcoded fallback if we have one —
    // still closer to reality than a rate that's never updated.
    return cachedRate || FALLBACK_RATE;
  }
};

const toNaira = async (usdAmount) => {
  const rate = await getUsdToNgnRate();
  return Math.round(usdAmount * rate * 100) / 100;
};

module.exports = { getUsdToNgnRate, toNaira };