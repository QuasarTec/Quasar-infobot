const client = require('../db');

module.exports = (username, amount, service) => {
  let currency = 'RUB';
  if (service === 'last_pay') {
    service = 'connect';
    currency = 'USD';
  }
  let query = `INSERT INTO payments_history (marketing, amount, user_id, currency) VALUES ('${service}', ${amount}, (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'), '${currency}');`;

  client.query(query);
};
