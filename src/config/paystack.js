const axios = require('axios');

const paystack = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  baseURL: 'https://api.paystack.co',

  request: function (method, path, data) {
    return axios({
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      data,
    }).then(res => res.data);
  },

  initializeTransaction: function (data) {
    return this.request('POST', '/transaction/initialize', data);
  },

  verifyTransaction: function (reference) {
    return this.request('GET', `/transaction/verify/${reference}`);
  },

  refund: function (data) {
    return this.request('POST', '/refund', data);
  },
};

module.exports = paystack;