const client = require("../db");

module.exports = (username, amount, service) => {
    let query = `INSERT INTO payments_history (marketing, amount, user_id) VALUES ('${service}', ${amount}, (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'));`;

    client.query(query);
}