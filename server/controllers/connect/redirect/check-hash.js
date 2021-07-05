const client = require('../../../../db');

module.exports = async (req, res) => {
  let { hash } = req.body;

  const get_user_by_hash = `SELECT * FROM redirect WHERE hash = '${hash}'`;

  const response = await client.query(get_user_by_hash);

  if (response.rowCount === 0) {
    return res.json({
      status: 'error',
      text: 'Not Found',
    });
  }

  if (new Date().getTime() - new Date(response.rows[0].datetime).getTime() > 1000 * 15) {
    deleteHash(response.rows[0].id);
    return res.json({
      status: 'error',
      text: 'Timeout',
    });
  }

  const get_username = `SELECT username FROM quasar_telegrambot_users_new WHERE id = ${response.rows[0].user_id}`;

  let username = await client.query(get_username);

  if (username.rowCount === 0) {
    deleteHash(response.rows[0].id);
    return res.json({
      status: 'error',
      text: 'User ID not valid',
    });
  }

  deleteHash(response.rows[0].id);
  return res.json({
    status: 'ok',
    username: username.rows[0].username,
  });
};

const deleteHash = (id) => {
  const query = `DELETE FROM redirect WHERE id = ${id}`;

  client.query(query);
};
