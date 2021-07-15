const client = require('../db');
const axios = require('axios');
const checkOnChatId = require('../utils/CheckOnChatId');

const successful =
    ' поздравляю! Твоя учетная запись найдена в глобальной базе State of Quasaria.\n\nВсего два шага:\n\nПолучи подарок и стань частью первого независимого цифрового государства State of Quasaria';
const not_found = ` в глобальной базе Quasar Technology не найден..\n
Проверьте указанный ник, на идентичность.
Если вы уверены, в том  что данные авторизации внесены верно, Вы зарегистрированы под указываемым Вами telegram ником, обратитесь за помощью тапнув по кнопке "тех поддержка"`;

module.exports = async (msg, bot, not_button = false) => {
    const params = {
        action: 'get',
        token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
        by: 'username',
        by_text: msg.chat.username,
    };

    let text;
    var options = {};

    await checkOnChatId(msg.chat.username, msg.chat.id);

    const resp = await axios
        .get(
            `https://api.quasaria.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`
        )
        .catch((err) => console.error(err));
    if (resp === undefined) return;
    if (resp.data.status === 'error') {
        options.reply_markup = JSON.stringify({
            inline_keyboard: [[{ text: 'Тех. Поддержка', callback_data: 'support' }]],
        });
        text = `Пользователь с ником @${params.by_text}` + not_found;
        if (not_button) {
            return {
                exist: false,
                text,
            };
        }
    } else {
        let query;

        let doesExistQuery = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}' OR username = '${msg.chat.username}'`;

        let res = await client.query(doesExistQuery);
        if (res.rowCount === 0) {
            query = `INSERT INTO quasar_telegrambot_users_new (username, chat_id, checked) 
                    VALUES ('${msg.chat.username}', '${msg.chat.id}', true)`;
            client.query(query, (err) => {
                if (err) console.log(err);
            });
        } else if (res.rows[0].chat_id === null) {
            query = `UPDATE quasar_telegrambot_users_new SET chat_id = ${msg.chat.id} WHERE username = '${params.by_text}';`;
            client.query(query, (err) => {
                if (err) console.log(err);
            });
        }

        query = `UPDATE quasar_telegrambot_users_new SET checked = true WHERE chat_id = ${msg.chat.id};`;
        client.query(query);

        options.reply_markup = JSON.stringify({
            inline_keyboard: [[{ text: 'State of Quasaria', callback_data: 'main' }]],
        });

        text = '@' + msg.chat.username + successful;

        doesExistQuery = `SELECT * FROM marketings WHERE user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}');`;

        res = await client.query(doesExistQuery);
        if (res.rowCount === 0) {
            query = `INSERT INTO marketings (user_id) 
                    VALUES ((SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}'));`;
            client.query(query, (err) => {
                if (err) throw err;
            });
        }
        if (not_button) {
            return {
                exist: true,
                text,
            };
        }
    }

    bot.sendMessage(msg.chat.id, text, options);

    if (resp.result === undefined) {
        return;
    }

    let inviter = resp.result.User.inviter;

    if (inviter[0] === '@') {
        inviter = inviter.substring(1);
    }

    let get_inviter_id = `SELECT chat_id FROM quasar_telegrambot_users_new WHERE Lower(username) = ${inviter.toLowerCase()}}`;

    let inviter_id = await client.query(get_inviter_id);

    if (inviter_id.rowCount === 0) {
        return;
    }

    let chat_id = inviter_id.rows[0].chat_id;

    bot.sendMessage(
        chat_id,
        `По вашей реферальной ссылке был заргестрирован пользователь @${msg.chat.username}`
    );
};
