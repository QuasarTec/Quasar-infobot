const checkOnAdmin = require('./checkOnAdmin');
const client = require('../../db');

module.exports = async (msg, bot, active_state) => {
    if(!await checkOnAdmin(msg.from.id)) {
        bot.sendMessage(msg.chat.id, 'Только администратор бота может активировать/деактивировать бота');
        return;
    }

    const query = `UPDATE chats SET active = ${active_state} WHERE chat_id = ${msg.chat.id}`;

    client.query(query);

    if (active_state) {
        bot.sendMessage(msg.chat.id, 'Бот активирован');
    } else {
        bot.sendMessage(msg.chat.id, 'Бот деактивирован');
    }
}