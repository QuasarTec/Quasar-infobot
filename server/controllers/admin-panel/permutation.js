const client = require('../../../db');

module.exports = (req, res) => {
  let { usernames } = req.body;

  usernames.forEach((el) => {
    if (el === '') {
      return;
    }
    el = el.split(':');

    let whom = el[0];
    let under_whom = el[1];

    if (whom[0] === '@') {
      //whom - string
      whom = whom.substring(1);
    }

    if (under_whom[0] === '@') {
      //under_whom - string
      under_whom = under_whom.substring(1);
    }

    const query = `UPDATE quasar_telegrambot_users_new SET ref_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${under_whom}') WHERE username = '${whom}';`;

    client.query(query);
  });

  res.send('Успешно');
};
