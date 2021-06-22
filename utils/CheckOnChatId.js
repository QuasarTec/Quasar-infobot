const client = require("../db");

module.exports = async (username, chat_id) => {
  let query = `SELECT chat_id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

  client.query(query, (err, res) => {
    if (err) throw err;
    if (res.rowCount === 0) {
      return;
    }
    query = `UPDATE quasar_telegrambot_users_new SET chat_id = ${chat_id} where username = '${username}'`;
    client.query(query);
  });

  query = `SELECT username FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id}`;

  let res = await client.query(query);

  if (res.rowCount === 0) {
    return;
  }

  if (res.rows[0].username !== username) {
    query = `UPDATE quasar_telegrambot_users_new SET username = '${username}' where chat_id = ${chat_id}`;
    client.query(query);
  }
};
