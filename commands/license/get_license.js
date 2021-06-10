const client = require('../../db')
const axios = require('axios');

const client_mysql = require('./mysql');

const INLINE_OPTIONS = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Назад', callback_data: 'license'}]
        ]
    }
}

module.exports = async (bot,msg) => {
    if (await checkDate(msg.chat.id, msg.chat.username)) {
        bot.sendMessage(msg.chat.id, 'Данная акция распростроняется, только для людей зарегестрированных начиная с 05.06.21 включительно', INLINE_OPTIONS);
        return;
    }

    if (await checkRecived(msg.chat.id, msg.chat.username)) {
        bot.sendMessage(msg.chat.id, 'Похоже вы уже получили свою лицензию', INLINE_OPTIONS);
        return;
    }

    if (await checkConnectNotPayed(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, 'Этот подарок могут забрать только те пользователи, кто проплатил сервис Connect', INLINE_OPTIONS);
        return;
    }

    let inviter = await getInviterName(msg.chat.username);

    let query = `SELECT * FROM \`Licensi\` WHERE Username = ${inviter}`;

    let user = await client_mysql.query(query)

    if (user.length === 0) {
        bot.sendMessage(msg.chat.id, 'Похоже, что у вашего пригласителя нет подарочных лицензий (Пригласитель тот, кто вас пригласил, а не тот, кого вам выдаёт бот за пригласителя. Хотя иногда это идинаковые люди)', INLINE_OPTIONS);
        return;
    }

    if (user[0].Limit <= 0) {
        if (user[1] !== undefined) {
            let delete_package = `DELETE FROM \`Licensi\` WHERE id = ${user[0].id}`;

            await client_mysql.query(delete_package);

            user.shift();
        } else {
            bot.sendMessage(msg.chat.id, 'Похоже, что у вашего пригласителя нет подарочных лицензий (Пригласитель тот, кто вас пригласил, а не тот, кого вам выдаёт бот за пригласителя. Хотя иногда это идинаковые люди)', INLINE_OPTIONS);
        }
    }		

    if (parseInt((new Date()-user[0].Timeset)/(24*3600*1000)) > user[0].LimitDay) {
        bot.sendMessage(msg.chat.id, 'Упс, похоже вы опоздали(((', INLINE_OPTIONS);
        return;
    }

    if (user[0].ActivateLicens === 'false') {
        bot.sendMessage(msg.chat.id, 'Похоже у вашего пригласителя не активирована раздача', INLINE_OPTIONS);
        return;
    }

    bot.sendMessage(msg.chat.id, 'Ваша лицензия\nLogin: PromoSoft\nPassword: CianoGenMob', INLINE_OPTIONS);

    let set_gift_recived = `UPDATE quasar_telegrambot_users_new SET gift_reviced = true WHERE chat_id = ${msg.chat.id}`;

    await client.query(set_gift_recived);

    let decriment_gifts = `UPDATE \`Licensi\` SET Limit=Limit-1 WHERE id = ${user[0].id}`;

    await client_mysql.query(decriment_gifts);
}

const checkDate = async (chat_id, username) => {
    let get_date_registaration = `SELECT datetime FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id};`;

    let registration_date = await client.query(get_date_registaration);

    registration_date = new Date(registration_date.rows[0].datetime);

    let start_date = new Date('2021-06-05T00:00:00.000Z');

    return start_date.getTime() > registration_date.getTime() && username !== 'jnecua123';
}

const checkRecived = async (chat_id) => {
    let gift_recived = `SELECT gift_recived FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id};`;

    let res = await client.query(gift_recived);

    return res.rowCount > 0 ? res.rows[0].gift_recived : false;
}

const checkConnectNotPayed = async (chat_id) => {
    let payed_query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id}`;

    let payed = await client.query(payed_query);

    return payed.rowCount > 0 ? parseInt((new Date()-payed.rows[0].last_pay)/(24*3600*1000)) > 30 : false;
}

const getInviterName = async (username) => {
    const params = {
        action: 'get',
        token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
        by: 'username',
        by_text: username
    }

    const resp = await axios.get(`https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`).catch(err => console.error(err));
    if (resp.data.status === 'error') {
        bot.sendMessage(response.rows[0].chat_id, `Пользователя с ником @${params.by_text} на сайте https://easy-stars.ru не найдено.\nПроверьте ники, на идентичность.\nЕсли вы уверены, что зарегестрировались, под вашим телеграм ником, обратитесь за помощью на сайте`); 
        return;
    }


    let inviter = resp.data.result.User.inviter;

    console.log(inviter);
    
    return inviter;
}
