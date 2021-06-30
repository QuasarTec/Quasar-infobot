const client = require('../db.js');

const new_accruals = async () => {
<<<<<<< HEAD
  let query = `SELECT username FROM quasar_telegrambot_users_new WHERE last_pay < '${new Date().toUTCString()}'`;
=======
  let query = `SELECT username FROM quasar_telegrambot_users_new WHERE last_pay < Now()`;
>>>>>>> 62e31abc236f76d63cbfe1fbe849ada25c9d7725

  let res = await client.query(query);

  for (let i = 0; i < res.rowCount; i++) {
    console.log('@' + res.rows[i].username);
  }
};

new_accruals();
