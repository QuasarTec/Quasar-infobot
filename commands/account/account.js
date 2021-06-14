const client = require('../../db');
const checkOnChatId = require('../../utils/CheckOnChatId');

module.exports = async (msg, opts) => {
    await checkOnChatId(msg.chat.username, msg.chat.id)

    let query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}'`;

    if (opts !== undefined) {
        var response = {opts}
    } else {
        var response = { opts: {} }
    }

    const res = await client.query(query)
    if (res.rowCount === 0) {
        response.text = 'Мы не можем найти ваш аккаунт, попробуйте позже или обратитесь за помощью на сайте'
    }else if (res.rows[0].last_pay === null) {
        response.text = 'Похоже вы ещё не оплатили использование реферальной системы';
        response.opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Оплата', callback_data: 'pay' }],
                [{ text: 'Главное меню', callback_data: 'main' }]
            ]
        });
    } else if (parseInt((new Date()-res.rows[0].last_pay)/(24*3600*1000)) > 30) {
        response.text = 'Похоже время подписки истекло';
        response.opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Продлить подписку', callback_data: 'pay' }],
                [{ text: 'Главное меню', callback_data: 'main' }]
            ]
        });
    } else {
        response.text = 'Личный кабинет. Свой доход вы можете увидеть в личном кабинете на оф. сайте компании: easy-stars.ru'
        response.opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Количество рефералов', callback_data: 'refs_count' }, { text: 'Просмотреть рефералов', callback_data: 'refs'}],
                [{ text: 'Ваш пригласитель', callback_data: 'inviter' }],
                [{ text: 'Реферальная ссылка', callback_data: 'ref_link'}],
                [{ text: 'Начисления', callback_data: 'accruals_connect'}],
                [{ text: 'Главное меню', callback_data: 'main' }],
                [{ text: 'Назад', callback_data: 'connect'}]
            ]
        });
    }

    return response;
}