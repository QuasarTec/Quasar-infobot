const client = require('../../db');
const checkOnAdmin = require('./checkOnAdmin');

module.exports = async (msg, bot) => {
    if (!(await checkOnAdmin(msg.from.id))) {
        bot.sendMessage(msg.chat.id, 'Только администратор бота может изменять текст сообщения');
        return;
    }

    const query = `UPDATE chats SET msg_text = '${msg.text.replace(
        '/change_text ',
        ''
    )}' WHERE chat_id = '${msg.chat.id}'`;

    client.query(query, (err) => {
        if (err) {
            bot.sendMessage(msg.chat.id, 'Текст успешно неизменён');
        } else {
            bot.sendMessage(msg.chat.id, 'Текст успешно изменён');
        }
    });
};
