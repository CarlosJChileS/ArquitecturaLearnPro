const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY || '';

module.exports = new Resend(apiKey);
