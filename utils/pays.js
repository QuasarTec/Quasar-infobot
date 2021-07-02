const client = require('../db.js');
const axios = require('axios');
const token = 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31';

const send_pays = async () => {
  let query = `SELECT * FROM payments_history WHERE datetime > '2021-06-29 23:01:01.450158';`;

  let res = await client.query(query);

  let data = {};

  for (let i = 0; i < res.rowCount; i++) {
    query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = ${res.rows[i].user_id};`;

    let username = await client.query(query);

    if (username.rowCount === 0 || username.rows[0].username === 'undefined') {
      continue;
    }

    if (data['@' + username.rows[0].username] === undefined) {
      data['@' + username.rows[0].username] = {
        usd: 0.88,
      };
      continue;
    }

    data['@' + username.rows[0].username] = {
      usd: +(data['@' + username.rows[0].username].usd + 0.88).toFixed(2),
    };
  }

  Object.keys(data).forEach((el) => {
    console.log(`{"${el}":${JSON.stringify(data[el])}}`);
    axios({
      method: 'post',
      url: 'https://api.easy-stars.ru/api/pay/add_balance',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `token=${encodeURIComponent(token)}&json={"${el}":${JSON.stringify(data[el])}}`,
    })
      .catch((err) => {
        console.error(err);
      })
      .then((res) => console.log(res.data));
  });
};

send_pays();
