const client = require('../db');
const checkOnChatId = require('../utils/CheckOnChatId');
const fs = require('fs');
const { default: axios } = require('axios');

let welcomeText = ` приветствуем тебя! Я главный бот компании Quasar Technology, в моем арсенале имеется все  необходимое для автоматизации твоего  бизнеса!\n\nЧто бы начать пользоваться моим функционалом, сервисами и инструментами, ты должен быть зарегистрирован на главном сайте компании, с учетом реферальной ссылки по которой тебя пригласил наставник! Если Вам не была выдана реферальная ссылка для регистрации на оф. сайте компании, обратитесь за ней к своему пригласителю..`;

var options = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{ text: 'О компании', callback_data: 'about' }],
            [{ text: 'Получить подарок', callback_data: 'get_license' }],
            [{ text: 'Оплата', callback_data: 'services' }],
        ],
    }),
};

module.exports = async (msg, bot) => {
    const { username, id } = msg.chat;

    const query = `INSERT INTO quasar_telegrambot_users_new (username, chat_id) 
                    VALUES ('${username}', '${id}')`;

    await checkOnChatId(username, id);
    const doesExistQuery = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${id}' OR username = '${username}'`;

    client.query(doesExistQuery, async (err, res) => {
        if (err) throw err;
        if (res.rowCount < 1) {
            client.query(query);
        }

        const ref_uuid = await get_ref_uuid(msg);

        if (ref_uuid !== '') {
            const check_on_ref_uuid = `SELECT id FROM quasar_telegrambot_users_new WHERE ref_uuid = '${ref_uuid}'`;

            const ref_uuid_exist = await client.query(check_on_ref_uuid);

            if (ref_uuid_exist.rowCount !== 0) {
                const update = `UPDATE quasar_telegrambot_users_new SET chat_id = ${msg.chat.id}, username = '${username}' WHERE ref_uuid = '${ref_uuid}'`;

                await client.query(update);
            } else {
                const update = `UPDATE quasar_telegrambot_users_new SET ref_uuid = '${ref_uuid}' WHERE chat_id = '${msg.chat.id}'`;

                await client.query(update);
            }
        }

        fs.readFile(`${__dirname}/static/img/welcome.jpg`, async (err, data) => {
            if (err) {
                console.error(err);
                bot.sendMessage(msg.chat.id, `@${username}` + welcomeText, options);
                return;
            }
            options.caption = `@${username}` + welcomeText;
            await bot.sendPhoto(msg.chat.id, data, options);
        });
    });
};

const get_ref_uuid = async (msg) => {
    let text = msg.text;

    if (text.split(' ').length > 1) {
        return text.split(' ')[1];
    }

    const get_user_url = `https://api.quasaria.ru/api/query/user/get?action=get&token=D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31&by=username&by_text=${msg.from.username}`;

    let res = await axios.get(get_user_url);

    if (res === undefined || res.data.status === 'error') {
        return '';
    }
    let link = res.data.result.User.referral_link;

    let ref_uuid = link.split('/')[link.split('/').length - 1];

    return ref_uuid;
};
