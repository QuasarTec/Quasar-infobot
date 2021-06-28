const client = require('../../db');

module.exports = async (data, service) => {
  let sending_msg = {
    opts: data.opts,
  };

  let currency = 'руб';

  let get_total_of_accruals = `SELECT SUM(amount) AS total FROM payments_history WHERE user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = ${data.msg.chat.id}) AND marketing = '${service}';`;

  if (service === 'connect') {
    currency = '$';
  }

  let res = await client.query(get_total_of_accruals);

  if (res.rows[0].total === null) {
    sending_msg.text = `На вашем счету: 0.00 ${currency}`;
  } else {
    sending_msg.text = `На вашем счету: ${Number(res.rows[0].total).toFixed(2)} ${currency}`;
  }

  sending_msg.opts.reply_markup = {
    inline_keyboard: [
      [
        {
          text: 'Назад',
          callback_data:
            service === '' ? `account` : service === '' ? `account` : `account_${service}`,
        },
      ],
      [{ text: 'Главная', callback_data: 'main' }],
    ],
  };

  return sending_msg;
};
