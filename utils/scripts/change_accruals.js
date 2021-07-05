const fs = require('fs');
const client = require('../../db');

const changre_accruals = async () => {
  fs.readFile(__dirname + '/check.txt', async (err, data) => {
    if (err) throw err;
    data = data.toString();
    let lines = data.split('\n');
    lines.forEach(async (line) => {
      let username = line.split(':')[0];
      let amount = Number(line.split(':')[1]);

      const get_sum = `SELECT sum(amount) as total FROM payments_history WHERE user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}')`;

      let sum = await client.query(get_sum);

      if (sum.rows[0].total === null) {
        sum.rows[0].total = 0;
      }

      sum.rows[0].total = Number(sum.rows[0].total);

      console.log(sum.rows[0].total, ' ', amount, ' ', (amount - sum.rows[0].total).toFixed(2));
    });
  });
};

changre_accruals();
