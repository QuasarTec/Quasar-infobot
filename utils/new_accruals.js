const client = require('../db.js');

const new_accruals = async () => {
  let query = `SELECT username FROM quasar_telegrambot_users_new WHERE last_pay < '${new Date().toUTCString()}'`;

  let res = await client.query(query);

  for (let i = 0; i < res.rowCount; i++) {
    console.log('@' + res.rows[i].username);
  }
};

new_accruals();
