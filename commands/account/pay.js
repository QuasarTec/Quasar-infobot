let token = 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31';
const client = require('../../db');
const axios = require('axios');
const checkOnChatId = require('../../utils/CheckOnChatId');

module.exports = async (msg, bot, pay_name = 'last_pay', amount = 960, curr = 'RUB') => {
    await checkOnChatId(msg.chat.username, msg.chat.id);

    if (pay_name === 'last_pay') {
        query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}';`;
    } else {
        query = `SELECT m.${pay_name} FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${msg.chat.id}';`;
    }
    let res = await client.query(query);

    const opts = {
        reply_markup: {
            inline_keyboard: [[{ text: 'Сервисы', callback_data: 'services' }]],
        },
    };

    if (res.rowCount === 0) {
        return `Пользователь не найден`;
    }
    if (parseInt((new Date() - res.rows[0][pay_name]) / (24 * 3600 * 1000)) <= 30) {
        return 'Время вашей подписки ещё не истекло';
    } else {
        const get_ref_uuid = `SELECT ref_uuid FROM quasar_telegrambot_users_new WHERE username = '${msg.chat.username}';`;

        const ref_uuid = (await client.query(get_ref_uuid)).rows[0].ref_uuid;

        let response = await axios({
            method: 'post',
            url: 'https://api.quasaria.ru/api/pay/get_pay_link',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: `token=${encodeURIComponent(token)}&${
                ref_uuid ? 'ref_uuid' : 'username'
            }=${encodeURIComponent(
                ref_uuid ? ref_uuid : '@' + msg.chat.username
            )}&m_curr=${curr}&m_amount=${amount}&desc=${pay_name}`,
        }).catch((err) => console.error(err));
        
        if (response.data.status === 'error') {
            bot.sendMessage(msg.chat.id, 'Пользователь с таким ником на сайте не найден', opts);
            return true;
        } else if (response.data.status === 'success') {
            query = `INSERT INTO signatures (user_id, sign) VALUES
                    ((SELECT id FROM quasar_telegrambot_users_new WHERE chat_id=${msg.chat.id}), 
                    '${response.data.response.sing}');`

            client.query(query, (err, res) => {
                if (err) {
                    bot.sendMessage(
                        msg.chat.id,
                        'Похоже что-то сломалось, обратитесь за помощью на сайте',
                        opts
                    );
                    return;
                }
            });

            await bot.sendMessage(msg.chat.id, 'Перейдите по ссылке ниже и оплатите подписку: ');
            bot.sendMessage(msg.chat.id, response.data.response.link, opts);

            return true;
        }
    }
};
