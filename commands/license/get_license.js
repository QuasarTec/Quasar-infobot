const client = require('../../db');
const axios = require('axios');

const client_mysql = require('./mysql');

const INLINE_OPTIONS = {
  reply_markup: {
    inline_keyboard: [[{ text: 'Назад', callback_data: 'main' }]],
  },
};

module.exports = async (bot, msg) => {
  if (await checkDate(msg.chat.id, msg.chat.username)) {
    bot.sendMessage(
      msg.chat.id,
      'Данная акция распростроняется, только для людей зарегестрированных начиная с 11.06.21 включительно',
      INLINE_OPTIONS
    );
    return;
  }

  if ((await checkRecived(msg.chat.id, msg.chat.username)) && msg.chat.username !== 'jnecua123') {
    bot.sendMessage(
      msg.chat.id,
      'Похоже Вы уже получили свою подарочную лицензию, по правилам компании получить подарок можно только 1 раз',
      INLINE_OPTIONS
    );
    return;
  }

  let inviter = await getInviterName(msg.chat.username);

  let query = `SELECT * FROM \`Licensi\` WHERE Username = '${
    inviter[0] === '@' ? inviter : '@' + inviter
  }';`;
  let user = await client_mysql.query(query);

  if (user.length === 0) {
    /*bot.sendMessage(
      msg.chat.id,
      `Уважаемый @${msg.chat.username}, к сожалению у Вашего пригласителя нет подарочных, программных  лицензий.. Рекомендую обратиться за разъяснениями к своему наставнику или задать вопрос чатах Quasar Tehnology`,
      INLINE_OPTIONS
    );
    return;*/
    query = `SELECT * FROM \`Licensi\` WHERE Username = '@EasyStarsMain';`;
    user = await client_mysql.query(query);
  }

  if (user[0].Limit <= 0) {
    if (user[1] !== undefined) {
      let delete_package = `DELETE FROM \`Licensi\` WHERE id = ${user[0].id}`;

      await client_mysql.query(delete_package);

      user.shift();
    } else {
      bot.sendMessage(
        msg.chat.id,
        `Уважаемый @${msg.chat.username}, к сожалению у Вашего пригласителя закончились подарочные, программные  лицензии.. Рекомендую обратиться за разъяснениями к своему наставнику или задать вопрос чатах Quasar Tehnology`,
        INLINE_OPTIONS
      );
    }
  }

  if (
    await checkLicensesPerDay(user[0].LimitDay, user[0].LimitDate, user[0].PromoType, user[0].id)
  ) {
    bot.sendMessage(
      msg.chat.id,
      `Уважаемый @${msg.chat.username}, лимит выдачи подарочных программных лицензий у Вашего пригласителя на сегодня исчерпан.. Вы сможете получить свой подарок завтра. Если у Вас возникли сложности или вопросы, обратитесь за разъяснениями к своему наставнику или в чаты Quasar Tehnology`
    );
    return;
  }

  if (user[0].ActivateLicens === 'false') {
    bot.sendMessage(
      msg.chat.id,
      `Уважаемый @${msg.chat.username}, к сожалению у вашего пригласителя не активирована функция распространения подарочных, программных лицензий.. \nЕсли Вы хотите получить свой подарок, перешлите данное сообщение пригласителя и попросите его обратиться в администрацию компании для успешного решения данного вопроса\nЕсли у Вас возникли сложности или вопросы, обратитесь за разъяснениями к своему наставнику или в чаты Quasar Tehnology`,
      INLINE_OPTIONS
    );
    return;
  }

  let photo_caption = `@${msg.chat.username}  поздравляю! Вам выписана подарочная лицензия сроком на 2 недели.\nУникальная программа для автоматизации бизнеса и привлечения бесплатного, бесконечного, целевого трафика из соц. сети ВКонтакте, теперь Ваша!\nОтправляю Вам:\n• Архив с программой\n• Описание программного функционала \n• Доступы для авторизации в программе\n• Обучение по использованию софта\nОбращаю внимание, получить программу. VkConnect бесплатно, Вы можете став пользователем Connect сервиса коллективных видео конференций. Смотри подробности в разделе «Для партнеров»  =>  «Продукты и сервисы» в личном кабинете главного бота компании`;

  let doc_caption = `Описание VkConnect:\n• Многопоточность\n• Автоприём заявок в друзья\n• Автосообщение + Указание имени получателя\n• Рассылка заявок в друзья по ключевому слову \n• Рассылка заявок в друзья по рекомендованным друзьям \n• Лайкинг\n• Рандомизация текста \n• Автоматическая мультиупаковка аккаунтов \n• Возможность использования  прокси\n• Умный 6 уровневый рандомизированный автоответчик`;

  await bot.sendPhoto(msg.chat.id, __dirname.replace('license', 'static/img/gift_license.jpg'), {
    caption: photo_caption,
  });

  await bot.sendDocument(
    msg.chat.id,
    __dirname.replace('license', 'static/rar/services/VKConnect.rar'),
    {
      caption: doc_caption,
    }
  );

  bot.sendMessage(
    msg.chat.id,
    `Ваша лицензия\nLogin: PromoSoft\nPassword: CianoGenMob\nОбучение по работе с программой:\nhttps://youtu.be/kFlbqTKS3IE`,
    INLINE_OPTIONS
  );

  let set_gift_recived = `UPDATE quasar_telegrambot_users_new SET gift_recived = true WHERE chat_id = ${msg.chat.id}`;

  await client.query(set_gift_recived);

  let decriment_gifts = `UPDATE Licensi SET \`Limit\` = \`Limit\` -1, LimitDay=LimitDay-1 WHERE id = ${user[0].id};`;

  if ((user[0].Username = 'Vmlynko')) {
    decriment_gifts = `UPDATE Licensi SET \`Limit\` = \`Limit\` -1 WHERE id = ${user[0].id};`;
  }

  await client_mysql.query(decriment_gifts);
};

const checkDate = async (chat_id, username) => {
  let get_date_registaration = `SELECT datetime FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id};`;

  let registration_date = await client.query(get_date_registaration);

  registration_date = new Date(registration_date.rows[0].datetime);

  let start_date = new Date('2021-06-05T00:00:00.000Z');

  return start_date.getTime() > registration_date.getTime() && username !== 'jnecua123';
};

const checkRecived = async (chat_id) => {
  let gift_recived = `SELECT gift_recived FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id};`;

  let res = await client.query(gift_recived);

  return res.rowCount > 0 ? res.rows[0].gift_recived : false;
};

const getInviterName = async (username) => {
  const params = {
    action: 'get',
    token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
    by: 'username',
    by_text: username,
  };

  const resp = await axios
    .get(
      `https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`
    )
    .catch((err) => console.error(err));
  if (resp.data.status === 'error') {
    bot.sendMessage(
      response.rows[0].chat_id,
      `Пользователя с ником @${params.by_text} на сайте https://easy-stars.ru не найдено.\nПроверьте ники, на идентичность.\nЕсли вы уверены, что зарегестрировались, под вашим телеграм ником, обратитесь за помощью на сайте`
    );
    return;
  }

  let inviter = resp.data.result.User.inviter;

  return inviter;
};

const checkLicensesPerDay = async (limitDay, limitDate, promoType, id) => {
  if (limitDate !== new Date().toJSON().slice(0, 10)) {
    var licenses;
    if (promoType === 1) {
      licenses = 17;
    } else if (promoType === 2) {
      licenses = 24;
    } else if (promoType === 3) {
      licenses = 40;
    }

    updateLimitDate = `UPDATE Licensi SET LimitDay = ${licenses}, LimitDate = Now() WHERE id = ${id}`;

    client_mysql.query(updateLimitDate);

    return false;
  }

  if (limitDay <= 0) {
    return true;
  }

  return false;
};
