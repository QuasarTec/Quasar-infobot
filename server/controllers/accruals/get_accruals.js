var client = require('../../../db');

module.exports = async (req, res) => {
  //api получения суммы начислений пользователя
  let username = req.query.username;

  if (username === undefined) {
    res.json({
      status: 'error',
      text: 'Ник не указан',
    });
  }

  if (username[0] === '@') {
    username = username.substring(1);
  }

  const get_id = `SELECT id FROM quasar_telegrambot_users_new WHERE Lower(username) = '${username.toLowerCase()}'`;

  let id = await client.query(get_id);

  if (id.rowCount === 0) {
    return res.json({
      status: 'error',
      text: 'Not Found',
    });
  }

  id = id.rows[0].id;

  const get_sum_of_accruals = `SELECT SUM(amount) AS total FROM payments_history WHERE user_id = ${id} AND marketing = 'connect' AND currency = 'USD'`;

  let sum = await client.query(get_sum_of_accruals);
  res.json({
    status: 'ok',
    total: sum.rows[0].total === null ? 0 : sum.rows[0].total,
  });
  return;
};
