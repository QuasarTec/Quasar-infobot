const client = require('../../db');
const token = '1615772907:AAGoM7p1WgrKmS6ZtZBIHjkbwE1VC-XLtn0';

module.exports = (msg, bot) => {
    const admin_options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: 'Админ-панель', callback_data: 'admin_panel' }],
            ]
        })
    }

    if(msg.text.indexOf(token) !== -1){
        bot.sendMessage(msg.chat.id, 'Вы теперь админ', admin_options);

        const query = `UPDATE quasar_telegrambot_users_new
                        SET is_admin = true
                        WHERE username = '${ msg.from.username }'`;

        client.query(query, (err, _res) => {
            console.log(err ? err.stack : 'User has been granted admin rights');
        });
    }
    else{
        bot.sendMessage(msg.chat.id, 'Неправильный токен');
    }
}