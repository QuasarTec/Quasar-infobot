const TelegramBot = require('node-telegram-bot-api');
const client = require('./db');
const commands = require('./commands/index');
const referrals = require('./utils/findRefs');
const token = '1615772907:AAHrJzpQ8JC7eAFky8L3Y1siWdHj1piWu8E';
const axios = require('axios');
const fs = require('fs');
const services = require('./commands/services/index');
const schedule = require('./utils/schedule/schedule');

let sendMsgMass;
let isSendingMessage = false;
let isSendingMessageNews = false;
let isCheckingUser = false;
let news = {};

const bot = new TelegramBot(token, { polling: true });

schedule(bot);

bot.onText(/\/start/, async (msg, _match) => {
  if (msg.chat.type !== 'private') return;
  commands.start(msg, bot);
});

bot.onText(/\/be_admin(.+)/, (msg, _match) => {
  if (msg.chat.type !== 'private') return;
  commands.admin.beAdmin(msg, bot);
});

bot.onText(/\/admin_panel/, (msg, _match) => {
  if (msg.chat.type !== 'private') return;
  commands.admin.adminPanel(msg, bot);
});

bot.onText(/\/change_text(.+)/, (msg, _match) => {
  if (msg.chat.type === 'private') return;
  commands.admin.changeText(msg, bot);
});

bot.onText(/\/activate_bot/, (msg, _match) => {
  if (msg.chat.type === 'private') return;
  commands.admin.activateDeactivateBot(msg, bot, true);
});

bot.onText(/\/deactivate_bot/, (msg, _match) => {
  if (msg.chat.type === 'private') return;
  commands.admin.activateDeactivateBot(msg, bot, false);
});

bot.onText(/\/get_list_all_users/, async (msg) => {
  console.log(await commands.refs.downRefferals(msg));
});

bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;

  let opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };

  let text = '';

  if (action === 'traffic') {
    text =
      'Всего 2 шага: \n 1. Необходимо авторизоваться или зарегистрироваться по ссылке https://easy-stars.ru/ \n 2. Переходи по ссылке: https://easy-stars.ru/shop/star/EasyTrafficSoft  \n 3. Покупай звезду за 0₽ и получай первую 1000 лицензий! \n После выполнения пунктов пропиши /check \n Человечеству от Quasar Technology';
  } else if (action === 'home') {
    text = 'Главная';
    opts.reply_markup = options.reply_markup;
  } else if (action === 'admin_panel') {
    text = 'Админ панель';
    opts.reply_markup = JSON.stringify({
      inline_keyboard: [
        [{ text: 'Создать оповещение', callback_data: 'notification' }],
        [
          {
            text: 'Проверить пользователя на наличие',
            callback_data: 'check_user',
          },
        ],
      ],
    });
  } else if (action === 'check_user') {
    text = 'Введите ник пользователя';
    isCheckingUser = true;
  } else if (action === 'choose_users') {
    text = 'Выберите, кому делать рассылку';
    opts.reply_markup = JSON.stringify({
      inline_keyboard: [[{ text: 'Все пользователи', callback_data: 'all' }]],
    });
  } else if (action === 'notification') {
    text = 'Введите свое сообщение здесь';
    isSendingMessage = true;
  } else if (action === 'send') {
    const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id > 0;`;
    isSendingMessage = false;
    text = 'Рассылка была сделана';

    client.query(query, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      for (let row of res.rows) {
        sendMsgMass(row.chat_id);
      }
    });
  } else if (action === 'new_news') {
    isSendingMessageNews = false;
    text = 'Новость была сделана';
    if (news === {}) {
      text = 'Новость пуста';
      return;
    }
    let query;
    if (news.text === undefined) {
      query = `INSERT into quasar_telegrambot_news (text, img_id) VALUES ('${
        news.caption === undefined ? '' : news.caption
      }', '${news.photo_id}')`;
    } else {
      query = `INSERT into quasar_telegrambot_news (text) VALUES ('${news.text}')`;
    }
    await client.query(query);
  } else if (action === 'deny') {
    text = 'Рассылка была отменена';
    isSendingMessage = false;
  } else if (action === 'license') {
    let text =
      'Для активации текущих лицензий пройдите в канал по этой ссылке https://t.me/joinchat/_mTE43yQKy03MmUy и прочитайте закреп.';
    let options = {};
    options.reply_markup = {
      inline_keyboard: [
        [{ text: 'Получить лицензию', callback_data: 'get_license' }],
        [{ text: 'Назад', callback_data: 'main' }],
      ],
    };
    bot.sendMessage(msg.chat.id, text, options);
  } else if (action === 'main') {
    let text = `@${msg.chat.username} следуя моим рекомендациям ты легко разберёшься во всех тонкостях и быстро достигнешь желаемого результата\n\nДам тебе совет.. Перед началом работы ознакомься с информацией в разделе  «Для партнера»\n\nЖми нужную кнопку и погнали!`;
    let opts = {
      caption: text,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Для партнера', callback_data: 'for_partners' }],
          //[{ text: 'О компании', callback_data: 'about'}],
          [{ text: 'Мои кабинеты', callback_data: 'services' }],
          //[{ text: 'Активация лицензий', callback_data: 'license'}],
          [{ text: 'Обратная связь', callback_data: 'support' }],
          [{ text: 'Тех поддержка', callback_data: 'support' }],
          //[{ text: 'Количество рефералов', callback_data: 'refs_count' }, { text: 'Просмотреть рефералов', callback_data: 'refs'}],
          //[{ text: 'Реферальная ссылка', callback_data: 'ref_link'}]
        ],
      },
    };
    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/main.jpg`, opts);
  } else if (action === 'pay') {
    const res = await commands.account.pay(msg, bot, 'last_pay', 12, 'USD');
    if (res !== true) {
      text = res;
    }
  } else if (
    action === 'refs_count' ||
    (action.split('_')[0] === 'refs' && action.split('_')[1] === 'count')
  ) {
    let query = `SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id}`;

    const res = await client.query(query);

    const response = referrals.transformRefs(await referrals.getAllReferals([res.rows[0].id], 9));

    if (response === undefined) {
      text = 'Похоже у вас нет рефералов';
    } else {
      text = `У вас ${
        response.flat().length
      } рефералов.\nПриводите ещё, чтобы зарабатывать больше!`;
    }

    var service;

    if (action.split('_').length > 2) {
      service = action.split('_');

      service.shift();
      service.shift();

      service = service.join('_');

      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Назад', callback_data: service === '' ? `account` : `account_${service}` }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    } else {
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Назад', callback_data: 'account' }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    }
  } else if (
    action === 'refs' ||
    (action.split('_')[0] === 'refs' && action.split('_')[1] !== 'list')
  ) {
    link = await commands.refs.downRefferals(msg, true);
    let opts = {};
    let text = `Уважаемый партнёр, для просмотра личной структуры нажмите  нужную Вам кнопку в меню`;
    if (action.split('_').length > 1) {
      service = action.split('_');

      service.shift();

      service = service.join('_');

      link = await commands.refs.downRefferals(msg, true, service);
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Визуальный просмотр', url: link }],
          [
            { text: 'Показать списком', callback_data: `refs_list_${service}` },
            { text: 'Показать списком активных', callback_data: `active_refs_list_${service}` },
          ],
          [{ text: 'Назад', callback_data: service === '' ? `account` : `account_${service}` }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    } else {
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Визуальный просмотр', url: link }],
          [
            { text: 'Показать списком', callback_data: 'refs_list' },
            { text: 'Показать списком активных', callback_data: `active_refs_list` },
          ],
          [{ text: 'Назад', callback_data: 'account' }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    }

    let img = fs.readFileSync(`${__dirname}/commands/static/img/refs.jpg`);
    await bot.sendPhoto(msg.chat.id, img);
    bot.sendMessage(msg.chat.id, text, opts);
  } else if (
    action === 'refs_list' ||
    action.split('_')[0] === 'refs' ||
    (action.split('_')[0] === 'active' && action.split('_')[1] === 'refs')
  ) {
    let text = '';
    let opts = {}
    if (action.split('_')[0] === 'active') {
      let service = action.split('_');

      service.shift();
      service.shift();
      service.shift();

      service = service.join('_');

      if (service === '') {
        service = 'last_pay';
      }

      text = await commands.refs.downRefferals(msg, false, service, true);
    } else {
      text = await commands.refs.downRefferals(msg);
    }

    if (action.split('_').length > 1) {
      service = action.split('_');

      service.shift();
      service.shift();

      if (action.split('_')[0] === 'active') {
        service.shift();
      }

      service = service.join('_');

      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Назад', callback_data: service === '' ? 'refs' : `refs_${service}` }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    } else {
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Назад', callback_data: `refs` }],
          [{ text: 'Главное меню', callback_data: 'main' }],
        ],
      });
    }
    bot.sendMessage(msg.chat.id, text, opts)
  } else if (action === 'ref_link' || action.split('_')[0] === 'ref') {
    const params = {
      action: 'get',
      token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
      by: 'username',
      by_text: '@' + msg.chat.username,
    };

    const response = await axios
      .get(
        `https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`
      )
      .catch((err) => console.error(err));
    if (response.data.status === 'error' || response === undefined) {
      text = `Пользователя с ником @${params.by_text} на сайте https://easy-stars.ru не найдено.\nПроверьте ники, на идентичность.\nЕсли вы уверены, что зарегестрировались, под вашим телеграм ником, обратитесь за помощью на сайте`;
    } else {
      if (response.data.result.User.referral_link === false) {
        text =
          'Для получения реферальной ссылки необходимо приобрести звезду "Franchise EasyStars company" по ссылке:\nhttps://easy-stars.ru/shop/star/Franchise_EasyStars_company';
      } else {
        text = `Ваша реферальная ссылка:\n${response.data.result.User.referral_link}`;
      }
    }

    if (action.split('_').length > 1) {
      service = action.split('_');

      service.shift();
      service.shift();

      service = service.join('_');

      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Личный кабинет',
              callback_data: service === '' ? `account` : `account_${service}`,
            },
          ],
        ],
      });
    } else {
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [[{ text: 'Личный кабинет', callback_data: 'account' }]],
      });
    }
  } else if (action === 'check') {
    commands.check(msg, bot);
  } else if (action === 'message' || action === 'service_message') {
    let options = {
      parse_mode: 'HTML',
    };
    options.reply_markup = JSON.stringify({
      inline_keyboard: [
        [{ text: 'Маркетинг', callback_data: 'marketing_message' }],
        //[{text: 'Скачать', callback_data: 'message_download'}],
        [{ text: 'Назад', callback_data: 'services' }],
      ],
    });

    let img = [
      {
        type: 'photo',
        media: `${__dirname}/commands/static/img/social_message.jpg`,
      },
      {
        type: 'photo',
        media: `${__dirname}/commands/static/img/func.jpg`,
      },
    ];

    await bot.sendMediaGroup(msg.chat.id, img, {
      parse_mode: 'HTML',
      caption: `<b>Quasar Social Message\n\n💯% - ая автоматизация  любого бизнеса планеты!</b>`,
    });

    let messageText = fs.readFileSync(`${__dirname}/commands/static/html/func.html`);
    bot.sendMessage(msg.chat.id, messageText, options);
  } else if (action === 'message_download') {
    let new_msg_id = (await bot.sendMessage(msg.chat.id, 'Подождите, файл загружается')).message_id;
    await bot.sendDocument(
      msg.chat.id,
      `${__dirname}/commands/static/exe/Quasar\ Message\ Setup\ 1.8.0.exe`,
      {
        caption: `Программы для автоматизации бизнеса так же запускаются из мессенджера. Подробно ознакомиться с их функционалом Вы сможете тапнув по кнопке "Автоматизация", или на сайте Easy-Stars.ru в разделе "Магазин звезд"\n\nДля дальнейшего пользования продуктами, Вам необходимо: скачать, распаковать и установить архив Quasar Message `,
      }
    );
    bot.deleteMessage(msg.chat.id, new_msg_id);
  } else if (action === 'connect') {
    let connect = `${__dirname}/commands/static/img/connect.jpg`;
    let connect_desk = `${__dirname}/commands/static/img/connect_desk.jpg`;
    let caption = `📢 ZOOM И SKYPE ПОД НАТИСКОМ КОНКУРЕНЦИИ!\n\nУникальный, высокотехнологичный сервис для коллективных\nвидеоконференций Connect: qtconnect.ru\n\nМы платим за общение каждому, громко завил Connect! \n\nВыгода очевидна: \n\n📍 Безлимитное количество участников конференции всего за 960₽ в месяц, а от имени гостя, и вовсе бесплатно! \n\n📍 Подарок от легендарного бренда Quasar Technology, программа для полной автоматизации Vk и получения бесплатного, целевого трафика, с возможностью ее применения по личным нуждам партнера!\n\n📍Революционная безопасность Ваших переговоров и данных стала возможной благодаря внедренным при разработке, технологиям безсерверверной обработки данных и их  криптошифрования\n\n📍 Готовая модель высокодоходного it бизнеса без границ\n\n📍Значительно доступней Skype и Zoom\n\nСпроси себя, какой была бы моя жизнь, будь я партнером Skype или Zoom с их основания? Но, знал бы прикуп, жил бы в Сочи..\n\nConnect, даёт возможность наверстать упущенное каждому. Необходимо сделать лишь один шаг!`;

    await bot.sendMediaGroup(msg.chat.id, [
      {
        type: 'photo',
        media: connect,
      },
      {
        type: 'photo',
        media: connect_desk,
      },
    ]);
    let options = {};
    options.reply_markup = JSON.stringify({
      inline_keyboard: [
        [{ text: 'Маркетинг', callback_data: 'marketing_connect' }],
        [{ text: 'Описание', callback_data: 'connect_desk' }],
        [{ text: 'О подарке', callback_data: 'about_gift' }],
        [{ text: 'Видеоконференции Connect', url: 'https://qtconnect.ru' }],
        [{ text: 'Личный кабинет', callback_data: 'account' }],
        [{ text: 'Назад', callback_data: 'services' }],
      ],
    });
    bot.sendMessage(msg.chat.id, caption, options);
  } else if (action === 'marketing_connect') {
    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/marketing_connect.jpg`, {
      parse_mode: 'HTML',
      caption: `<b>Маркетинг Connect сервиса, это классический, девятиуровневый "Квинтет"</b><i>\n\nПрибыль партнёров сервиса, растёт в соответствии с увеличением структуры, а ежемесячные выплаты по маркетингу, делают его мега востребованным!\n\nФинансовая модель маркетинга, проста и понятна каждому. В основу заложен классический, 9 уровневый "квинтет"\n\nВ первой линии, Вашего кабинета, стоит 5 человек, под каждым из них, расположено тоже по 5 партнёров. По этому принципу, программный алгоритм выстраивает Вашу  структуру на 9 уровней в глубину и равномерно распределяет по ней ежемесячную партнерскую прибыль!\n\nС каждой поступившей за услуги сервиса оплаты, 30% идёт в компанию, а 70% равномерно распределяется на 9 уровней, по Вашей структуре. К примеру, если кто то с 9 уровня Вашей структуры осуществит приглашение, то 9 человек стоящие над ним вверх (включая Вас), получат с новичка ежемесячную прибыль в размере 75₽</i>`,
    });
    fs.readFile(`${__dirname}/commands/static/html/connect_marketing.html`, (err, data) => {
      if (err) throw err;
      bot.sendMessage(msg.chat.id, data, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: 'connect' }],
            //[{text: 'Главное меню', callback_data: 'main'}]
          ],
        },
      });
    });
  } else if (action === 'connect_desk') {
    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/connect_funcs.jpg`);
    fs.readFile(`${__dirname}/commands/static/html/connect_desk.html`, (err, data) => {
      if (err) throw err;
      bot.sendMessage(msg.chat.id, data, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Назад', callback_data: 'connect' }],
            //[{text: 'Главное меню', callback_data: 'main'}]
          ],
        },
      });
    });
  } else if (action === 'about_gift') {
    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/gift_license.jpg`, {
      caption: `Хорошие новости! Если Вы Партнер сервиса Connect, Компания дарит Вам уникальный софт! Программа «VkConnect», созданная для автоматизации вашего бизнеса и привлечения бесплатного, не ограниченного, целевого трафика из соц сети Вконтакте\n\n• Смотри пользовательскую инструкцию \n• Скачивай программу \n• Запускай программу \n• Зарабатывай с Connect!`,
    });
    await bot.sendDocument(msg.chat.id, `${__dirname}/commands/static/rar/services/VKConnect.rar`, {
      parse_mode: 'HTML',
      caption: `<b>Описание VkConnect: </b>\n<i>\n• Многопоточность\n• Автоприём заявок в друзья\n• Автосообщение + Указание имени получателя\n• Рассылка заявок в друзья по ключевому слову \n• Рассылка заявок в друзья по рекомендованным друзьям \n• Лайкинг\n• Рандомизация текста \n• Автоматическая мультиупаковка аккаунтов \n• Возможность использования  прокси\n• Умный 6 уровневый рандомизированный автоответчик</i>`,
    });
    await bot.sendMessage(
      msg.chat.id,
      `Обучение по работе с программой VkConnect:\https://youtu.be/kFlbqTKS3IE`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Назад', callback_data: 'connect' }]],
        },
      }
    );
  } else if (action === 'qcloud' || action === 'service_qcloud') {
    fs.readFile(`${__dirname}/commands/static/html/qcloud.html`, async (err, data) => {
      let opts = {};

      opts.parse_mode = 'HTML';
      opts.reply_markup = {
        inline_keyboard: [
          [{ text: 'Маркетинг', callback_data: 'marketing_qcloud' }],
          [{ text: 'Личный кабинет', callback_data: 'none' }],
          [{ text: 'Назад', callback_data: 'services' }],
        ],
      };
      await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/qcloud.jpg`, {
        parse_mode: 'HTML',
        caption: data,
      });

      await bot.sendMessage(
        msg.chat.id,
        `Данная технология открывает пользователю безграничные возможности, максимально оптимизирующие рабочие и бытовые процессы любого уровня сложности.\n\nС подробным описанием технологии можно ознакомиться по ссылке: <a href="https://ru.m.wikipedia.org/wiki/%D0%9E%D0%B4%D0%BD%D0%BE%D1%80%D0%B0%D0%BD%D0%B3%D0%BE%D0%B2%D0%B0%D1%8F_%D1%81%D0%B5%D1%82%D1%8C">Одноранговые сети</a>`,
        {
          parse_mode: 'HTML',
        }
      );

      fs.readFile(`${__dirname}/commands/static/html/QCloud_v1.1.0.html`, async (err, data) => {
        bot.sendMessage(msg.chat.id, data, opts);
      });
    });
  } else if (action === 'account') {
    query = `SELECT last_pay, checked FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id} OR username = '${msg.chat.username}'`;

    let res = await client.query(query);
    if (res.rowCount === 0) {
      text = `Пользователь с ником @${msg.chat.username} в базе бота не найден`;
      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Тех. Поддержка', callback_data: 'support' }],
          [{ text: 'Назад', callback_data: 'start' }],
        ],
      });
    } else {
      if (res.rows[0].checked) {
        let res = await commands.account.account(msg, opts);
        text = res.text;
      } else {
        text = `Пользователь с ником @${msg.chat.username} в базе бота не найден`;
        opts.reply_markup = JSON.stringify({
          inline_keyboard: [
            [{ text: 'Тех. Поддержка', callback_data: 'support' }],
            [{ text: 'Назад', callback_data: 'start' }],
          ],
        });
      }
    }
  } else if (action === 'support') {
    bot.sendMessage(
      msg.chat.id,
      'Если у вас возникли проблемы в работе с ботом, вы можете прописать /start и попробовать повторить сои действия, если это не помогло, вы можете обратиться за помощью на сайте https://easy-stars.ru/contacts/'
    );
  } else if (action === 'for_partners') {
    let text = `История твоего успеха уже началась. Жми на нужную кнопку моего меню и я с радостью помогу тебе во всем разобраться!`;
    let opts = {
      caption: text,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Квалификационный тест', callback_data: 'first_steps' }],
          [{ text: 'О компании', callback_data: 'about' }],
          [{ text: 'Quasar навигация', callback_data: 'navigate' }],
          [{ text: 'Сервисы и маркетинг', callback_data: 'services' }],
          [{ text: 'Обучение', callback_data: 'tutorial' }],
          [{ text: 'Рекламный контент', callback_data: 'none' }],
          [{ text: 'Обратная связь', callback_data: 'none' }],
          [{ text: 'Назад', callback_data: 'main' }],
        ],
      },
    };
    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/first_steps.jpg`, opts);
  } else if (action === 'mentor' || action.split('_')[0] === 'mentor') {
    const query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id})`;

    let res = await client.query(query);

    if (action.split('_').length > 1) {
      service = action.split('_');

      service.shift();

      service = service.join('_');

      opts.reply_markup = JSON.stringify({
        inline_keyboard: [
          [{ text: 'Назад', callback_data: service === '' ? `account` : `account_${service}` }],
        ],
      });
    } else {
      opts.reply_markup = {
        inline_keyboard: [[{ text: 'Назад', callback_data: 'account' }]],
      };
    }

    if (res.rowCount === 0) {
      text = 'У вас нет пригласителя';
    } else {
      text = `Ваш пригласитель: @${res.rows[0].username}`;
    }
  } else if (action === 'inviter' || action.split('_')[0] === 'inviter') {
    const params = {
      action: 'get',
      token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
      by: 'username',
      by_text: msg.chat.username,
    };

    const resp = await axios
      .get(
        `https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`
      )
      .catch((err) => console.error(err));
    if (resp === undefined) return;
    if (resp.data.status === 'error') {
      options.reply_markup = JSON.stringify({
        inline_keyboard: [[{ text: 'Тех. Поддержка', callback_data: 'support' }]],
      });
      text = `Пользователь с ником @${params.by_text}` + not_found;
    } else {
      if (action.split('_').length > 1) {
        service = action.split('_');

        service.shift();

        service = service.join('_');

        opts.reply_markup = JSON.stringify({
          inline_keyboard: [
            [{ text: 'Назад', callback_data: service === '' ? `account` : `account_${service}` }],
          ],
        });
      } else {
        opts.reply_markup = {
          inline_keyboard: [[{ text: 'Назад', callback_data: 'account' }]],
        };
      }

      if (!resp.data.result.User.inviter) {
        text = 'У вас нет пригласителя';
      } else {
        text = `Ваш пригласитель: ${resp.data.result.User.inviter}`;
      }
    }
  } else if (action === 'create_news') {
    text = 'Введите свою новость здесь:';
    isSendingMessageNews = true;
  } else if (action === 'news') {
    const query = `SELECT * FROM quasar_telegrambot_news ORDER BY id DESC LIMIT 5;`;

    let res = await client.query(query);

    let opts = {
      reply_markup: {
        inline_keyboard: [[{ text: 'Главная', callback_data: 'main' }]],
      },
    };

    if (res.rowCount === 0) {
      bot.sendMessage(msg.chat.id, 'Похоже новостей ещё нет', opts);
    }

    for (let i = res.rowCount - 1; i >= 0; i--) {
      if (res.rows[i].img_id === null) {
        bot.sendMessage(msg.chat.id, res.rows[i].text, i - 1 === res.rowCount ? opts : {});
      } else {
        if (i - 1 === res.rowCount) {
          bot.sendPhoto(msg.chat.id, res.rows[i].img_id);
          bot.sendMessage(msg.chat.id, res.rows[i].text, opts);
        }
        bot.sendPhoto(msg.chat.id, res.rows[i].img_id, {
          caption: res.rows[i].text === null ? '' : res.rows[i].text,
        });
      }
    }
  } else if (action === 'services') {
    let text = `@${msg.chat.username}, переходя по кнопкам, ты ознакомишься с информацией о стоимости  услуг/маркетингов на сервисы и программные продукты компании Quasar Tehnology`;
    let opts = {};
    opts.reply_markup = {
      inline_keyboard: [
        [
          { text: 'Connect', callback_data: 'connect' },
          { text: 'QCloud', callback_data: 'qcloud' },
        ],
        [
          { text: 'Quasar Message', callback_data: 'message' },
          { text: 'Franchise QT', callback_data: 'service_franchise' },
        ],
      ],
    };
    const query = `SELECT m.franchise_pay FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${msg.chat.id}';`;

    let res = await client.query(query);

    //if (res.rowCount === 0 || (res.rows[0].franchise_pay !== null && parseInt((new Date()-res.rows[0].franchise_pay)/(24*3600*1000)) <= 30)) {
    opts.reply_markup.inline_keyboard.push(
      [
        { text: 'InstaComment', callback_data: 'service_insta_comment' },
        { text: 'InstaKing', callback_data: 'service_insta_king' },
      ],
      [
        { text: 'SkypeLead', callback_data: 'service_skype_lead' },
        { text: 'SkypeReg', callback_data: 'service_skype_reg' },
      ],
      [
        { text: 'VkLead', callback_data: 'service_vk_lead' },
        { text: 'VkReg', callback_data: 'service_vk_reg' },
      ],
      [
        { text: 'Tele Lead', callback_data: 'service_tele_lead' },
        { text: 'Autopilot', callback_data: 'service_autopilot' },
      ]
    );
    //}
    opts.reply_markup.inline_keyboard.push([
      { text: 'Назад', callback_data: res.rowCount === 0 ? 'start' : 'main' },
    ]);

    bot.sendMessage(msg.chat.id, text, opts);
  } else if (action === 'about') {
    let caption =
      '1 апреля 2020 года, команда из 12 человек, соучередила компанию "EasyStars".\n\nПродуктами компании являлись программы для привлечения трафика из социальных сетей, подкрепленные универсальным маркетинг планом.\nБлагодаря ростущему спросу на программные продукты компании и их первокласному качеству, компания EasyStars стремительно завоевала внимание мирового бизнес сообщества.\n\nС момента основания, компанией:\n• Выпущено 4 революционных сервиса и 14 уникальных программных продуктов\n• Произведена глобальная  капитализация и выпуск цифровых акций\n• Реализована личная автономная экономика \n• Введена в финансовой оборот собственная крипто валюта.\n\nМонеты TopCoin (tc) и LeadCoin (lc) \n\nВ январяе 2021 года, благодаря ребрендингу, компания переименовалась в "Quasar Technology" и перешла на новую модель финансового управления (смена маркетинга).\n\nСегодня компания Quasar Technology является разработчиком высокотехнологичных бизнес  продуктов. \n\nРеволюционные решения программных инженеров Quasar Technology, сделали компанию мировым лидером на рынке "Information Business Technology", а фундаментальные принципы социальной инженерии, заложенные в основу выпускаемых продуктов, сделали их доступными, эффективными и простыми в использовании.\n\nФактически освободив пользователя от временных финансовых трат на различные расходные материалы, за короткий срок, Quasar Technology стала второй семьёй для партнеров из более чем 40 стран мира.\n\nУникальные технологии, сервисы и продукты открыли безграничные возможности  перед человечеством!\n\nОзнакомиться с маркетингом, функционалом сервисов и программных продуктов компании, можно перейдя в раздел "Сервисы и маркетинг"';

    await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/about_company.jpg`);

    bot.sendMessage(msg.chat.id, caption, {
      reply_markup: {
        inline_keyboard: [[{ text: 'Назад', callback_data: 'main' }]],
      },
    });
  } else if (action === 'get_license') {
    await require('./commands/license/get_license')(bot, msg);
  } else if (action === 'how_to_register') {
    let opts = {
      reply_markup: {
        inline_keyboard: [[{ text: 'Назад', callback_data: 'start' }]],
      },
    };
    let text = `Регистрация в сервисах Quasar Tehnology, осуществляется исключительно по средствам личных приглашений!\n\nПартнеры компании имеют эксклюзивный доступ к маркетингу и ее уникальным сервисам, реализованным для быстрого привлечения целевого трафика, а так же автоматизации и оптимизации работы в сети интернет\n\nДля того что бы стать партнером компании, Вам необходимо зарегистрироваться на официальном сайте компании по реферальной ссылке своего пригласителя`;

    bot.sendMessage(msg.chat.id, text, opts);
  } else if (action === 'start') {
    await commands.start(msg, bot);
  } else if (action === 'navigate') {
    fs.readFile(`${__dirname}/commands/static/html/navigate.html`, (err, data) => {
      if (err) throw err;
      bot.sendMessage(msg.chat.id, data, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: 'Назад', callback_data: 'for_partners' }]],
        },
      });
    });
  } else if (action === 'tutorial') {
    let text = 'Обучение (Этот раздел ещё не готов)';
    let opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Сервисы', callback_data: 'tutorial_services' }],
          [{ text: 'Программы', callback_data: 'tutorial_programs' }],
          [{ text: 'Назад', callback_data: 'for_partners' }],
        ],
      },
    };
    bot.sendMessage(msg.chat.id, text, opts);
  } else if (action === 'tutorial_services') {
    let text = 'Обучение сервисам (Раздел  не готов)';
    let opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Connect', callback_data: 'none' }],
          [{ text: 'QCloud', callback_data: 'none' }],
          [{ text: 'Quasar Message', callback_data: 'none' }],
          [{ text: 'Назад', callback_data: 'tutorial' }],
        ],
      },
    };
    bot.sendMessage(msg.chat.id, text, opts);
  } else if (action === 'tutorial_programs') {
    let text = 'Обучение программам (Раздел  не готов)';
    let opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'VkLead', callback_data: 'none' }],
          [{ text: 'VkReg', callback_data: 'none' }],
          [{ text: 'SkypeLead', callback_data: 'none' }],
          [{ text: 'SkypeReg', callback_data: 'none' }],
          [{ text: 'InstaComment', callback_data: 'none' }],
          [{ text: 'InstaKing', callback_data: 'none' }],
          [{ text: 'TeleLead', callback_data: 'none' }],
          [{ text: 'Назад', callback_data: 'tutorial' }],
        ],
      },
    };
    bot.sendMessage(msg.chat.id, text, opts);
  } else if (action === 'service_franchise') {
    let text = 'Контент к данному разделу находится в разработке';
    let opts = {
      reply_markup: {
        inline_keyboard: [[{ text: 'Назад', callback_data: 'services' }]],
      },
    };
    bot.sendMessage(msg.chat.id, text, opts);
  } else {
    let res = await services(action, {
      msg,
      opts,
      text,
      bot,
    });

    if (res !== undefined) {
      text = res.text;
      opts = res.opts;
    }
  }
  if (text !== '' && text !== undefined) {
    bot.editMessageText(text, opts);
  }
});

bot.on('polling_error', (err) => console.error(err));

bot.on('new_chat_members', async (msg) => {
  const get_text = `SELECT msg_text, active FROM chats WHERE chat_id = '${msg.chat.id}'`;

  let res = await client.query(get_text);

  if (msg.new_chat_participant.username === 'quasar_infobot' || res.rowCount === 0) {
    const chatDoesNotExist = `SELECT * FROM chats WHERE chat_id = '${msg.chat.id}'`;

    const res = await client.query(chatDoesNotExist);

    if (res.rowCount > 0) {
      return;
    }

    const default_text = '&&&, привет!';
    const query = `INSERT INTO chats (chat_id, msg_text, active, name) VALUES ('${msg.chat.id}', '${default_text}', true, '${msg.chat.title}')`;

    client.query(query);
    if (msg.new_chat_participant.username === 'quasar_infobot') {
      return;
    }
    res = await client.query(get_text);
  }

  let post = res.rows[0];

  if (post.active) {
    let text = post.msg_text;
    text = text.replace('&&&', '@' + msg.new_chat_participant.username);
    bot.sendMessage(msg.chat.id, text);
    return;
  }
});

bot.on('message', (message) => {
  if (message.chat.type !== 'private') return;
  if (isSendingMessage) {
    const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${message.chat.id}'`;

    client.query(query, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      if (res.rows[0].is_admin) {
        sendConfirmationMessage(message);
      } else {
        bot.sendMessage(
          message.chat.id,
          'Вы не можете отправлять сообщения, поскольку не являетесь админом'
        );
      }
    });
  } else if (isCheckingUser) {
    isCheckingUser = false;
    let text = '';
    let opts = {};
    opts.reply_markup = JSON.stringify({
      inline_keyboard: [[{ text: 'назад', callback_data: 'admin_panel' }]],
    });
    let username = message.text;
    if (username[0] === '@') {
      username = username.substring(1);
    }
    const query = `SELECT * FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    client.query(query, async (err, res) => {
      if (err) {
        //console.error(err);
        text = 'Произошла ошибка';
        bot.sendMessage(message.chat.id, text, opts);

        return;
      }

      if (res.rowCount === 0) {
        text = `Пользователя с ником ${username} не существует`;
      } else {
        for (let i = 0; i < res.rowCount; i++) {
          let inviter;
          let payed = await findPayedServces(res.rows[i].id);
          if (res.rows[i].ref_id !== 0) {
            let query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = ${res.rows[i].ref_id}`;
            inviter = await client.query(query);
            if (inviter.rowCount === 0) {
              inviter = 'Похоже у пользователя нет пригласителя';
            } else {
              inviter = inviter.rows[0].username;
            }
          } else {
            inviter = 'Похоже у пользователя нет пригласителя ';
          }
          text += `ID: ${res.rows[i].id}\nИмя пользователя: ${res.rows[i].username}\nChat ID: ${res.rows[i].chat_id}\nЭто админ: ${res.rows[i].is_admin}\nСигнатура для оплаты: ${res.rows[i].sign}\nПргласитель: ${inviter}\n\nОплачено: ${payed}`;
        }
      }
      bot.sendMessage(message.chat.id, text, opts);
    });
  } else if (isSendingMessageNews) {
    const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${message.chat.id}'`;

    client.query(query, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      if (res.rows[0].is_admin) {
        sendConfirmationMessage(message, true);
      } else {
        bot.sendMessage(
          message.chat.id,
          'Вы не можете отправлять сообщения, поскольку не являетесь админом'
        );
      }
    });
  }
});

const sendConfirmationMessage = (message, isNews = false) => {
  const send_opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Да', callback_data: isNews ? 'new_news' : 'send' }],
        [{ text: 'Нет', callback_data: 'deny' }],
      ],
    }),
  };

  if (isNews) {
    if (message.photo && message.photo[0] && message.photo[0].file_id) {
      news = {
        photo_id: message.photo[0].file_id,
        caption: message.caption,
      };
    } else {
      news = {
        text: message.text,
      };
    }
  }

  if (message.photo && message.photo[0] && message.photo[0].file_id) {
    sendMsgMass = (chat_id) =>
      bot.sendPhoto(chat_id, message.photo[0].file_id, {
        caption: message.caption,
      });
  } else {
    sendMsgMass = (chat_id) => bot.sendMessage(chat_id, message.text);
  }

  sendMsgMass(message.chat.id);
  bot.sendMessage(message.chat.id, isNews ? 'Сделать новость?' : 'Сделать рассылку?', send_opts);
};

const findPayedServces = async (id) => {
  const query = `SELECT m.*, u.last_pay FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.id = ${id};`;

  const res = await client.query(query);

  let text = '';

  Object.keys(res.rows[0]).forEach((el) => {
    if (
      el !== 'id' &&
      el !== 'user_id' &&
      parseInt((new Date() - res.rows[0][el]) / (24 * 3600 * 1000)) <= 30
    ) {
      text += `${el.replace('last_pay', 'connect').replace('_pay', '').replace('_', ' ')}, `;
    }
  });

  text = text.slice(0, -2);

  return text;
};

module.exports = bot;
