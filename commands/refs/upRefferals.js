const getAllInviters = require("../../utils/findInviters");
const client = require("../../db");
const checkOnChatId = require("../../utils/CheckOnChatId");

module.exports = async (msg, bot) => {
  await checkOnChatId(msg.chat.username, msg.chat.id);

  const query = `SELECT ref_id FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id};`;

  client.query(query, async (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    if (res.rows.length === 0) {
      bot.sendMessage(msg.from.id, "Пользователь не найден");
      return;
    }

    let refs = await getAllInviters(res.rows[0].ref_id, 9);
    let text = "";

    for (let i = 0; i < refs.length; i++) {
      if (refs[i].username === undefined) {
        continue;
      }
      text += `Уровень ${refs.length - i}:\n`;
      text += `@${refs[i].username}\n`;
    }

    if (text === "") {
      bot.sendMessage(msg.from.id, "У вас нет пригласителя");
      return;
    }
    bot.sendMessage(msg.from.id, text);
  });
};
