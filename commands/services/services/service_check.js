const client = require('../../../db');

module.exports = async (data, callback_name, name, db_field_name = 'last_pay') => {
    let sending_msg = {
        opts: data.opts
    }

    let query;

    if (db_field_name === 'last_pay') {
        query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE chat_id = '${data.msg.chat.id}';`;
    } else {
        query = `SELECT m.${db_field_name} FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${data.msg.chat.id}';`;
    }


    let res = await client.query(query);


    sending_msg.text = `Сервис ${name}`;
    if (res.rowCount === 0 || res.rows[0][db_field_name] === null) {
        sending_msg.opts.reply_markup = {
            inline_keyboard: [
                [{text: 'Маркетинг', callback_date: 'none'}],
                [{text: 'Оплата маркетинга', callback_data: callback_name}],
                [{text: 'Назад', callback_data: 'services'}],
                [{text: 'Главная', callback_data: 'main'}]
            ]
        }
    } else if (res.rowCount !== 0 && parseInt((new Date()-res.rows[0][db_field_name])/(24*3600*1000)) > 30) {
        sending_msg.text += '\nВремя вашей подписки истекло, для использования сервиса Connect необходимо продлить подписку';
        sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Маркетинг', callback_date: 'none'}],
                    [{text: 'Оплата маркетинга', callback_data: callback_name}],
                    [{text: 'Назад', callback_data: 'services'}],
                    [{text: 'Главная', callback_data: 'main'}]
                ]
        }
    } else {
        let query = `SELECT username FROM quasar_telegrambot_users_new WHERE chat_id = ${data.msg.chat.id};`

        let res = await client.query(query);
        
        sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Маркетинг', callback_date: 'none'}],
                    [{text: 'Визульный просмотр рефраллов', url: `https://matrix.easy-stars.ru/bot/referrals-vizualization?username=${res.rows[0].username}&type=${db_field_name}`}],
                    [{text: 'Посмотреть начисления', callback_data: `accruals_${db_field_name}`}],
                    [{text: 'Назад', callback_data: 'services'}],
                    [{text: 'Главная', callback_data: 'main'}]
                ]
        }
    }

    return sending_msg
}