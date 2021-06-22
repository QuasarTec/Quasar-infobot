const client = require("../db");
const checkOnChatId = require("../utils/CheckOnChatId");
const fs = require("fs");

let welcomeText = ` приветствуем тебя! Я главный бот компании Quasar Technology, в моем арсенале имеется все  необходимое для автоматизации твоего  бизнеса!\n\nЧто бы начать пользоваться моим функционалом, сервисами и инструментами, ты должен быть зарегистрирован на главном сайте компании, с учетом реферальной ссылки по которой тебя пригласил наставник! Если Вам не была выдана реферальная ссылка для регистрации на оф. сайте компании, обратитесь за ней к своему пригласителю..`;

var options = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "О компании", callback_data: "about" }],
      [{ text: "Сервисы и маркетинг", callback_data: "services" }],
      [{ text: "Как зарегистрироваться?", callback_data: "how_to_register" }],
      [{ text: "Проверить регистрацию", callback_data: "check" }],
    ],
  }),
};

module.exports = async (msg, bot) => {
  const { username, id } = msg.from;

  const query = `INSERT INTO quasar_telegrambot_users_new (username, chat_id) 
                    VALUES ('${username}', '${id}')`;

  await checkOnChatId(username, id);
  const doesExistQuery = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${id}'`;

  client.query(doesExistQuery, (err, res) => {
    if (err) throw err;
    if (res.rowCount < 1) {
      client.query(query);
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
