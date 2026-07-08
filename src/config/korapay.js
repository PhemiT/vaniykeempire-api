const axios = require('axios');

const korapay = {
  secretKey: process.env.KORAPAY_SECRET_KEY,
  baseURL: 'https://api.korapay.com/merchant/api/v1',

  request: function (method, path, data) {
    return axios({
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      data,
    }).then((res) => res.data);
  },

  initializeCharge: function (data) {
    return this.request('POST', '/charges/initialize', data);
  },

  verifyCharge: function (reference) {
    return this.request('GET', `/charges/${reference}`);
  },
};

module.exports = korapay;