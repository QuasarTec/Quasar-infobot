const client = require('../db');
const findInviters = require('./findInviters')

const notify = async (bot, username, user_id, type) => {
    const inviters = await findInviters(user_id, 9, type)

    let inviter_ids = []; 
    for(let i = 0; i < inviters.length; i++) {
        inviter_ids.push({
            id: inviters[i].id,
            level: inviters.length-i
        })
    }

    let inviter_chat_ids = await get_inviter_chat_ids(inviter_ids);
    
    inviter_chat_ids.forEach(el => {
        bot.sendMessage(el.chat_id, `У вас новый реферал ${el.level} уровня - @${username}!`)
    });
}

const get_inviter_chat_ids = async (ids) => {
    let chat_ids = [];

    for (let i = 0; i < ids.length; i++) {
        const el = ids[i];

        let query = `SELECT chat_id FROM quasar_telegrambot_users_new WHERE id = ${el.id}`;

        let res = await client.query(query);
        if (res.rows[0].chat_id !== null) {
            chat_ids.push({
                chat_id: res.rows[0].chat_id,
                level: el.level
            })
        }
    }

    return chat_ids;
}

module.exports = notify;