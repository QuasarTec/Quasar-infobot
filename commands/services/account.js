const { response } = require('express');
const bot = require('../../bot');
const client = require('../../db');

module.exports = async (data, service_callback, service, db_field_name) => {
  let query = `SELECT m.*, u.last_pay FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${data.msg.chat.id}'`;

  let response = {
    opts: {},
  };

  const res = await client.query(query);
  if (res.rowCount === 0) {
    response.text =
      'Мы не можем найти ваш аккаунт, попробуйте позже или обратитесь за помощью на сайте';
  } else if (res.rows[0][db_field_name] === null) {
    response.text = 'Похоже вы ещё не оплатили использование реферальной системы';
    response.opts.reply_markup = JSON.stringify({
      inline_keyboard: [
        [{ text: 'Оплата', callback_data: `pay_${service}` }],
        [{ text: 'Главное меню', callback_data: 'main' }],
      ],
    });
  } else if (parseInt((new Date() - res.rows[0][db_field_name]) / (24 * 3600 * 1000)) > 30) {
    response.text = 'Похоже время подписки истекло';
    response.opts.reply_markup = JSON.stringify({
      inline_keyboard: [
        [{ text: 'Продлить подписку', callback_data: `pay_${service}` }],
        [{ text: 'Главное меню', callback_data: 'main' }],
      ],
    });
  } else {
    response.text =
      'Личный кабинет. Свой доход вы можете увидеть в личном кабинете на оф. сайте компании: easy-stars.ru';
    response.opts.reply_markup = JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Количество рефералов',
            callback_data: `refs_count_${service}`,
          },
          { text: 'Просмотреть рефералов', callback_data: `refs_${service}` },
        ],
        [
          { text: 'Ваш пригласитель', callback_data: `inviter_${service}` },
          { text: 'Ваш наставник', callback_data: `mentor_${service}` },
        ],
        [{ text: 'Реферальная ссылка', callback_data: `ref_link_${service}` }],
        [{ text: 'Начисления', callback_data: `accruals_${service}` }],
        [{ text: 'Главное меню', callback_data: 'main' }],
        [{ text: 'Назад', callback_data: `${service_callback}` }],
      ],
    });
  }

  data.bot.sendMessage(data.msg.chat.id, response.text, response.opts);
};
