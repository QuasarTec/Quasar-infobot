const client = require('../../db');
const referrals = require('../../utils/findRefs');
const checkOnChatId = require('../../utils/CheckOnChatId');

const transformRefs = (refs, index = 9) => {
    let newRefs = [];

    for (let i = 0; i < refs.length; i++) {
        newRefs.push({
            value: refs[i].username,
            level: 9 - index,
            parent: refs[i].parent,
            active: refs[i].active,
        });
    }

    let refsNextLevel = [];

    for (let i = 0; i < refs.length; i++) {
        if (refs[i].refs !== undefined) {
            let r = transformRefs(refs[i].refs, index - 1);
            if (r !== undefined) {
                for (let j = 0; j < r.length; j++) {
                    if (r[j].constructor === Object) {
                        newRefs.push({
                            value: r[j].value,
                            level: r[j].level,
                            parent: r[j].parent,
                            active: r[j].active,
                        });
                        continue;
                    }
                    refsNextLevel.push({
                        value: r[j],
                        level: 9 - index,
                        parent: r[j].parent,
                        active: r[j].active,
                    });
                }
            }
        }
    }

    if (refsNextLevel.length > 0) {
        newRefs.push(refsNextLevel);
    }

    if (newRefs.length > 0) {
        return newRefs;
    }
};

module.exports = async (msg, link = false, services = 'last_pay', active = false) => {
    if ((services = 'connect')) {
        services = 'last_pay';
    }

    let query = `SELECT username FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id};`;

    let res = await client.query(query);

    if (link) {
        return `https://bot.quasaria.ru/bot/referrals-vizualization?username=${res.rows[0].username}&type=${services}`;
    }

    await checkOnChatId(msg.chat.username, msg.chat.id);

    query = `SELECT ref_id, username, id FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}'`;

    res = await client.query(query);
    if (res.rows.length === 0) {
        bot.sendMessage(msg.chat.id, 'Пользователь не найден');
        return;
    }

    let refs = await referrals.getAllReferals([res.rows[0].id], 9, false, services, active);

    let text = '';

    refs = transformRefs(refs);

    if (refs === undefined) {
        text = 'Похоже мы не можем найти у вас рефералов😔';
        return text;
    }

    refs = refs.flat();

    if (active) {
        let actived_refs = [];
        for (let i = 0; i < refs.length; i++) {
            if (refs[i].active) {
                actived_refs.push(refs[i]);
            }
        }
        refs = actived_refs;
    }

    levels = 0;

    for (let i = 0; i < refs.length; i++) {
        levels = Math.max(levels, refs[i].level);
    }

    levels++;

    for (let i = 0; i < levels; i++) {
        text += `Уровень ${i + 1}:\n`;
        let count = 0;
        for (let j = 0; j < refs.length; j++) {
            if (refs[j].level === i) {
                text += `@${refs[j].value} `;
                count++;
            }
        }
        text += `\nВсего пользователей: ${count}\n\n`;
    }

    if (text === '') {
        text = 'У вас нет рефералов';
    }
    return text;
};
