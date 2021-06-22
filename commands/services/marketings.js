const path = require('path');
const fs = require('fs');

module.exports = async (data, service) => {
  let pathToCaption = path.join(
    __dirname,
    '..',
    'static/html/marketings/photo_caption',
    `${service}.html`
  );

  let pathToPhoto = path.join(
    __dirname,
    '..',
    'static/img/marketings/',
    `${service}_marketing.jpg`
  );
  await fs.readFile(pathToCaption, async (err, text) => {
    if (err) throw err;

    await data.bot.sendPhoto(data.msg.chat.id, pathToPhoto, {
      parse_mode: 'HTML',
      caption: text,
    });

    let pathToExemple = path.join(__dirname, '..', 'static/html/marketings', `${service}.html`);

    fs.readFile(pathToExemple, (err, text) => {
      if (err) throw err;

      data.bot.sendMessage(data.msg.chat.id, text, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: 'Назад', callback_data: `service_${service}` }]],
        },
      });
    });
  });
};
