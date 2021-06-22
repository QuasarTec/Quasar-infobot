const client = require("../../db");

module.exports = (msg, bot) => {
  const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}'`;

  client.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    if (res.rows[0].is_admin) {
      const admin_opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              { text: "Создать оповещение", callback_data: "notification" },
              { text: "Список пользователей", callback_data: "get_users" },
              {
                text: "Установить пригласителя пользователю",
                callback_data: "set_inviter",
              },
            ],
            [{ text: "Создать новость", callback_data: "create_news" }],
            [
              {
                text: "Проверить пользователя на наличие",
                callback_data: "check_user",
              },
            ],
          ],
        }),
      };
      bot.sendMessage(msg.from.id, "Админ-панель", admin_opts);
    } else {
      bot.sendMessage(msg.chat.id, "Вы не являетесь админом");
    }
  });
};
