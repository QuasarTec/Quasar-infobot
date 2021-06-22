const client = require('../db');

let query = `SELECT datetime, id FROM quasar_telegrambot_users_new;`;

client.query(query, (err, res) => {
  res.rows.forEach((row) => {
    if (row.datetime === null) {
      client.query(
        `UPDATE quasar_telegrambot_users_new SET datetime = '2021-06-04T00:00:00.000Z' WHERE id = ${row.id};`
      );
    }
  });
});
