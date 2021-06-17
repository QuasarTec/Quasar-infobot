const TelegramBot = require('node-telegram-bot-api');
const client = require('./db');
const commands = require('./commands/index');
const referrals = require('./utils/findRefs');
const token = '1615772907:AAGoM7p1WgrKmS6ZtZBIHjkbwE1VC-XLtn0';
const axios = require('axios')
const fs = require('fs');
const services = require('./commands/services/index');
const schedule = require('./utils/schedule/schedule');

let sendMsgMass;
let isSendingMessage = false;
let isSendingMessageNews = false;
let isCheckingUser = false;
let news = {}

const bot = new TelegramBot(token, {polling: true});

schedule(bot);

bot.onText(/\/start/, async(msg, _match) => {
    if (msg.chat.type !== 'private') return;
    commands.start(msg, bot);
});

bot.onText(/\/be_admin(.+)/, (msg, _match) => {
    if (msg.chat.type !== 'private') return;
    commands.admin.beAdmin(msg,bot)
});

bot.onText(/\/admin_panel/, (msg, _match) => {
    if (msg.chat.type !== 'private') return;
    commands.admin.adminPanel(msg,bot)
});

bot.onText(/\/change_text(.+)/, (msg, _match) => {
    if (msg.chat.type === 'private') return;
    commands.admin.changeText(msg, bot);
})

bot.onText(/\/activate_bot/, (msg, _match) => {
    if (msg.chat.type === 'private') return;
    console.log('lol')
    commands.admin.activateDeactivateBot(msg, bot, true)
})

bot.onText(/\/deactivate_bot/, (msg, _match) => {
    if (msg.chat.type === 'private') return;
    commands.admin.activateDeactivateBot(msg, bot, false)
})


bot.on('callback_query', async callbackQuery => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;

    let opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    
    let text = "";
  
    if (action === 'traffic') {
        text = 'Всего 2 шага: \n 1. Необходимо авторизоваться или зарегистрироваться по ссылке https://easy-stars.ru/ \n 2. Переходи по ссылке: https://easy-stars.ru/shop/star/EasyTrafficSoft  \n 3. Покупай звезду за 0₽ и получай первую 1000 лицензий! \n После выполнения пунктов пропиши /check \n Человечеству от Quasar Technology';
    } else if (action === 'home'){
        text = 'Главная';
        opts.reply_markup = options.reply_markup;
    } else if (action === 'admin_panel'){
        text = 'Админ панель';
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Создать оповещение', callback_data: 'notification' }],
                [{ text: 'Проверить пользователя на наличие', callback_data: 'check_user'}]
            ]
        });
    } else if (action === 'check_user') {
        text = 'Введите ник пользователя';
        isCheckingUser = true;
    } else if (action === 'choose_users'){
        text = 'Выберите, кому делать рассылку';
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Все пользователи', callback_data: 'all' }]
            ]
        });
    } else if (action === 'notification'){
        text = 'Введите свое сообщение здесь';
        isSendingMessage = true;
    } else if (action === 'send'){
        const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id > 0;`;
        isSendingMessage = false;
        text = 'Рассылка была сделана'

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
        console.log(news);
        if (news === {}) {
            text = 'Новость пуста';
            return;
        }
        let query;
        if (news.text === undefined) {
            query = `INSERT into quasar_telegrambot_news (text, img_id) VALUES ('${news.caption === undefined ? '' : news.caption}', '${news.photo_id}')`;
        } else {
            query =  `INSERT into quasar_telegrambot_news (text) VALUES ('${news.text}')`;
        }
        await client.query(query);
    } else if (action === 'deny'){
        text = 'Рассылка была отменена';
        isSendingMessage = false;
    } else if (action === 'license') {
        let text = 'Для активации текущих лицензий пройдите в канал по этой ссылке https://t.me/joinchat/_mTE43yQKy03MmUy и прочитайте закреп.';
        let options = {};
        options.reply_markup = {
            inline_keyboard: [
                [{ text: 'Получить лицензию', callback_data: 'get_license'}],
                [{ text: 'Назад', callback_data: 'main'}]
            ]
        };
        bot.sendMessage(msg.chat.id, text, options);
    } else if (action === 'main') {
        let text = `@${msg.chat.username} следуя моим рекомендациям ты легко разберёшься во всех тонкостях и быстро достигнешь желаемого результата\n\nДам тебе совет.. Перед началом работы ознакомься с информацией в разделе  «Для партнера»\n\nЖми нужную кнопку и погнали!`
        let opts = {};
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Для партнера', callback_data: 'for_partners'}],
                //[{ text: 'О компании', callback_data: 'about'}],
                [{ text: 'Сервисы и маркетинг', callback_data: 'services'}],
                //[{ text: 'Активация лицензий', callback_data: 'license'}],
                [{ text: 'Обратная связь', callback_data: 'support'}]
                //[{ text: 'Количество рефералов', callback_data: 'refs_count' }, { text: 'Просмотреть рефералов', callback_data: 'refs'}],
                //[{ text: 'Реферальная ссылка', callback_data: 'ref_link'}]
            ]
        });
        await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/main.jpg`)
        bot.sendMessage(msg.chat.id, text, opts)

    } else if (action === 'pay') {
        const res = await commands.account.pay(msg,bot,'last_pay');
        if (res !== true) {
            text = res;
        }
        
    } else if (action === 'refs_count') {
        let query = `SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id}`;

        const res = await client.query(query)

        const response = referrals.transformRefs(await referrals.getAllReferals([res.rows[0].id], 9));

        if (response === undefined) {
            text = 'Похоже у вас нет рефералов'
        } else {
            text = `У вас ${response.flat().length} рефералов.\nПриводите ещё, чтобы зарабатывать больше!`
        }

        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Назад', callback_data: 'account' }],
                [{ text: 'Главное меню', callback_data: 'main' }]
            ]
        });

    } else if (action === 'refs') {
        link = await commands.refs.downRefferals(msg, true);
        let opts = {};
        let text = `Уважаемый партнёр, для просмотра личной структуры нажмите  нужную Вам кнопку в меню`;
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Визуальный просмотр', url: link }],
                [{ text: 'Показать списком', callback_data: 'refs_list' }],
                [{ text: 'Назад', callback_data: 'account' }],
                [{ text: 'Главное меню', callback_data: 'main' }]
            ]
        });
        let img = fs.readFileSync(`${__dirname}/commands/static/img/refs.jpg`);
        await bot.sendPhoto(msg.chat.id, img);
        bot.sendMessage(msg.chat.id, text, opts)
    } else if (action === "refs_list") {
        text = await commands.refs.downRefferals(msg);
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Назад', callback_data: 'refs' }],
                [{ text: 'Главное меню', callback_data: 'main' }]
            ]
        });
    } else if (action === "ref_link") {
        const query = `SELECT username FROM quasar_telegrambot_users_new WHERE chat_id = '${msg.chat.id}'`;

        const res = await client.query(query);

        const params = {
            action: 'get',
            token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
            by: 'username',
            by_text: '@'+msg.chat.username
        }
    

        const response = await axios.get(`https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`).catch(err => console.error(err));
        if (response.data.status === 'error') {
            text = `Пользователя с ником @${params.by_text} на сайте https://easy-stars.ru не найдено.\nПроверьте ники, на идентичность.\nЕсли вы уверены, что зарегестрировались, под вашим телеграм ником, обратитесь за помощью на сайте`; 
        } else {
            if (response.data.result.User.referral_link === false) {
                text = 'Для получения реферальной ссылки необходимо приобрести звезду "Franchise EasyStars company" по ссылке:\nhttps://easy-stars.ru/shop/star/Franchise_EasyStars_company'
            } else {
                text = `Ваша реферальная ссылка:\n${response.data.result.User.referral_link}`
            }
        }

        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Личный кабинет', callback_data: 'account' }],
            ]
        });
    } else if (action === "check") {
        commands.check(msg, bot);
    } else if (action === "message_new") {
        let options = {};
        options.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{text: 'О продукте', callback_data: 'about_message'}],
                [{text: 'Автоматизация', callback_data: 'auto'}],
                //[{text: 'Скачать', callback_data: 'message_download'}],
                [{text: 'Назад', callback_data: 'main'}]
            ]
        });
        
        bot.sendMessage(msg.chat.id, "Меню Quasar Message", options);
    } else if (action === "message") {
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{text: 'О продукте', callback_data: 'about_message'}],
                [{text: 'Автоматизация', callback_data: 'auto'}],
                //[{text: 'Скачать', callback_data: 'message_download'}],
                [{text: 'Личный кабинет', callback_data: 'service_message'}],
                [{text: 'Назад', callback_data: 'services'}]
            ]
        })
        
        text = "Меню Quasar Message";

    } else if (action === "message_download") {
        let new_msg_id = (await bot.sendMessage(msg.chat.id, 'Подождите, файл загружается')).message_id;
        await bot.sendDocument(msg.chat.id, `${__dirname}/commands/static/exe/Quasar\ Message\ Setup\ 1.8.0.exe`, {
            caption: `Программы для автоматизации бизнеса так же запускаются из мессенджера. Подробно ознакомиться с их функционалом Вы сможете тапнув по кнопке "Автоматизация", или на сайте Easy-Stars.ru в разделе "Магазин звезд"\n\nДля дальнейшего пользования продуктами, Вам необходимо: скачать, распаковать и установить архив Quasar Message `
        });
        bot.deleteMessage(msg.chat.id, new_msg_id);
    } else if (action === "about_message") {
        let img = fs.readFileSync(`${__dirname}/commands/static/img/func.jpg`);
        await bot.sendPhoto(msg.chat.id, img, {
            caption: `Quasar Social Message\n\n💯% - ая автоматизация  любого бизнеса планеты!`
        });

        await bot.sendVideo(msg.chat.id, `${__dirname}/commands/static/video/message.download`)

        await bot.sendDocument(msg.chat.id, `${__dirname}/commands/static/pdf/PDF\ презентация\ Quasar\ Message.pdf`)

        let messageText = fs.readFileSync(`${__dirname}/commands/static/html/func.html`);
        bot.sendMessage(msg.chat.id, messageText, {
            parse_mode: 'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'message_new'}],
                    [{text: 'Главное меню', callback_data: 'main'}]

                ]
            })
        });
    } else if (action === "connect") {
        let connect = `${__dirname}/commands/static/img/connect.jpg`
        let connect_desk = `${__dirname}/commands/static/img/connect_desk.jpg`
        let caption = `📢 ZOOM И SKYPE ПОД НАТИСКОМ КОНКУРЕНЦИИ!\n\nУникальный, высокотехнологичный сервис для коллективных\nвидеоконференций Connect: qtconnect.ru\n\nМы платим за общение каждому, громко завил Connect! \n\nВыгода очевидна: \n\n📍 Безлимитное количество участников конференции всего за 960₽ в месяц, а от имени гостя, и вовсе бесплатно! \n\n📍 Подарок от легендарного бренда Quasar Technology, программа для полной автоматизации Vk и получения бесплатного, целевого трафика, с возможностью ее применения по личным нуждам партнера!\n\n📍Революционная безопасность Ваших переговоров и данных стала возможной благодаря внедренным при разработке, технологиям безсерверверной обработки данных и их  криптошифрования\n\n📍 Готовая модель высокодоходного it бизнеса без границ\n\n📍Значительно доступней Skype и Zoom\n\nСпроси себя, какой была бы моя жизнь, будь я партнером Skype или Zoom с их основания? Но, знал бы прикуп, жил бы в Сочи..\n\nConnect, даёт возможность наверстать упущенное каждому. Необходимо сделать лишь один шаг!`;
        
        await bot.sendMediaGroup(msg.chat.id, [{
            type: "photo",
            media: connect
        },
        {
            type: "photo",
            media: connect_desk
        }]);
        let options = {};
        options.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{text: "Маркетинг", callback_data: "marketing_connect"}],
                [{text: "Описание", callback_data: "connect_desk"}],
                [{text: "О подарке", callback_data: "none"}],
                [{text: 'Видеоконференции Connect', url: 'https://qtconnect.ru'}],
                [{text: "Личный кабинет", callback_data: "account"}],
                [{text: "Назад", callback_data: "services"}]
            ]
        })
        bot.sendMessage(msg.chat.id, caption, options);
    } else if (action === "marketing_connect") {
        await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/marketing_connect.jpg`, {
            parse_mode: "HTML",
            caption: `<b>Маркетинг Connect сервиса, это классический, девятиуровневый "Квинтет"</b><i>\n\nПрибыль партнёров сервиса, растёт в соответствии с увеличением структуры, а ежемесячные выплаты по маркетингу, делают его мега востребованным!\n\nФинансовая модель маркетинга, проста и понятна каждому. В основу заложен классический, 9 уровневый "квинтет"\n\nВ первой линии, Вашего кабинета, стоит 5 человек, под каждым из них, расположено тоже по 5 партнёров. По этому принципу, программный алгоритм выстраивает Вашу  структуру на 9 уровней в глубину и равномерно распределяет по ней ежемесячную партнерскую прибыль!\n\nС каждой поступившей за услуги сервиса оплаты, 30% идёт в компанию, а 70% равномерно распределяется на 9 уровней, по Вашей структуре. К примеру, если кто то с 9 уровня Вашей структуры осуществит приглашение, то 9 человек стоящие над ним вверх (включая Вас), получат с новичка ежемесячную прибыль в размере 75₽</i>`
        });
        fs.readFile(`${__dirname}/commands/static/html/connect_marketing.html`, (err, data) => {
            if (err) throw err;
            bot.sendMessage(msg.chat.id, data, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Назад", callback_data: "connect"}],
                        [{text: 'Главное меню', callback_data: 'main'}]
                    ]
                }
            })
        })
    } else if (action === "connect_desk") {
        await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/connect_funcs.jpg`)
        fs.readFile(`${__dirname}/commands/static/html/connect_desk.html`, (err, data) => {
            console.log(data)
            if (err) throw err;
            bot.sendMessage(msg.chat.id, data, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{text: "Назад", callback_data: "connect"}],
                        [{text: 'Главное меню', callback_data: 'main'}]
                    ]
                }
            })
        })
    } else if (action === "qcloud") {

        await bot.sendVideo(msg.chat.id, `${__dirname}/commands/static/video/Презентация Q CLOUD.mp4`);

        let text = fs.readFileSync(`${__dirname}/commands/static/html/qcloud.html`);
         
        let opts = {};

        opts.parse_mode = "HTML";
        opts.reply_markup = {
            inline_keyboard: [
                [{text: 'Личный кабинет', callback_data: 'service_qcloud'}],
                [{text: "Назад", callback_data: "services"}]
            ]
        }

        bot.sendMessage(msg.chat.id, text, opts);
    } else if (action === "account") {
        query = `SELECT last_pay, checked FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id} OR username = '${msg.chat.username}'`;

        let res = await client.query(query);
        if (res.rowCount === 0) {
            text = `Пользователь с ником @${msg.chat.username} в базе бота не найден`;
            opts.reply_markup = JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Тех. Поддержка', callback_data: 'support' }],
                    [{ text: 'Главное меню', callback_data: 'main' }]
                ]
            })
        } else {
            if (res.rows[0].checked) {
                let res = await commands.account.account(msg,opts);
                text = res.text;
            } else {
                commands.check(msg, bot)
            }
        }
        
    } else if (action === "support") {
        bot.sendMessage(msg.chat.id, 'Если у вас возникли проблемы в работе с ботом, вы можете прописать /start и попробовать повторить сои действия, если это не помогло, вы можете обратиться за помощью на сайте https://easy-stars.ru/contacts/')
    } else if (action === "for_partners") {
        let text = `История твоего успеха уже началась. Жми на нужную кнопку моего меню и я с радостью помогу тебе во всем разобраться!`
        let opts = {};
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'Первые шаги', callback_data: 'first_steps'}],
                [{ text: 'Сервисы и маркетинг', callback_data: 'none'}],
                [{ text: 'О компании', callback_data: 'about'}],
                [{ text: 'Рекламный контент', callback_data: 'none'}],
                [{ text: 'Quasar навигация', callback_data: 'none'}],
                [{ text: 'Обратная связь', callback_data: 'none'}],
                [{ text: 'Назад', callback_data: 'main'}]
            ]
        });
        await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/first_steps.jpg`)
        bot.sendMessage(msg.chat.id, text, opts)
    } else if (action === "mentor") {
        const query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = (SELECT ref_id FROM quasar_telegrambot_users_new WHERE chat_id = ${msg.chat.id})`;

        let res = await client.query(query);

        opts.reply_markup = {
            inline_keyboard: [
                [{text: 'Назад', callback_data: 'account'}]
            ]
        }

        if (res.rowCount === 0) {
            text = 'У вас нет пригласителя';
        } else {
            text = `Ваш пригласитель: @${res.rows[0].username}`;
        }
    } else if (action === "inviter") {
        const params = {
            action: 'get',
            token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
            by: 'username',
            by_text: msg.chat.username
        }
    
        const resp = await axios.get(`https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`).catch(err => console.error(err));
        if (resp === undefined) return;
        if (resp.data.status === 'error') {
            options.reply_markup = JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Тех. Поддержка', callback_data: 'support' }],
                ]
            })
            text = `Пользователь с ником @${params.by_text}` + not_found; 
        } else {
            opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'account'}]
                ]
            }
    
            if (!resp.data.result.User.inviter) {
                text = 'У вас нет пригласителя';
            } else {
                text = `Ваш пригласитель: ${resp.data.result.User.inviter}`;
            }
        }
    } else if (action === "create_news") {
        text = "Введите свою новость здесь:";
        isSendingMessageNews = true;
    } else if (action === "news") {
        const query = `SELECT * FROM quasar_telegrambot_news ORDER BY id DESC LIMIT 5;`;

        let res = await client.query(query);

        let opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Главная', callback_data: 'main' }]
                ]
            }
        }

        if (res.rowCount === 0) {
            bot.sendMessage(msg.chat.id, 'Похоже новостей ещё нет', opts);
        }

        for (let i = res.rowCount-1; i>=0; i--) {
            if (res.rows[i].img_id === null) {
                bot.sendMessage(msg.chat.id, res.rows[i].text, i-1 === res.rowCount ? opts : {});
            } else {
                if (i-1 === res.rowCount) {
                    bot.sendPhoto(msg.chat.id, res.rows[i].img_id)
                    bot.sendMessage(msg.chat.id, res.rows[i].text, opts)
                }
                bot.sendPhoto(msg.chat.id, res.rows[i].img_id, {
                    caption: res.rows[i].text === null ? '' : res.rows[i].text
                })
            }
        }
    } else if (action === "services") {
        text = `@${msg.chat.username}, переходя по кнопкам, ты ознакомишься с информацией о стоимости  услуг/маркетингов на сервисы и программные продукты компании Quasar Tehnology`;
        opts.reply_markup = {
            inline_keyboard: [
                [{text: 'Connect', callback_data: 'connect'}],
                [{text: 'QCloud', callback_data: 'qcloud'}],
                [{text: 'Quasar Message', callback_data: 'message'}],
                [{text: 'Franchise', callback_data: 'service_franchise'}],
            ]
        }
        const query = `SELECT m.franchise_pay FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${msg.chat.id}';`;

        let res = await client.query(query);

        if (res.rowCount > 0 && res.rows[0].franchise_pay !== null && parseInt((new Date()-res.rows[0].franchise_pay)/(24*3600*1000)) <= 30) {
            opts.reply_markup.inline_keyboard.push(
                [{text: 'Insta Comment', callback_data: 'service_insta_comment'},{text: 'Insta Lead', callback_data: 'service_insta_lead'}],
                [{text: 'Skype Lead', callback_data: 'service_skype_lead'}, {text: 'Skype Reg', callback_data: 'service_skype_reg'}],
                [{text: 'VK Lead', callback_data: 'service_vk_lead'}, {text: 'VK Reg', callback_data: 'service_vk_reg'}],
                [{text: 'Tele Lead', callback_data: 'service_tele_lead'}],
                [{text: 'Autopilot', callback_data: 'service_autopilot'}],
                [{text: 'Insta King', callback_data: 'service_insta_king'}],
            )
        }
        opts.reply_markup.inline_keyboard.push(
            [{text: 'Назад', callback_data: 'main'}]
        )

        
    } else if (action === 'about') {
        let caption = '1 апреля 2020 года, команда из 12 человек, соучередила компанию "EasyStars".\n\nПродуктами компании являлись программы для привлечения трафика из социальных сетей, подкрепленные универсальным маркетинг планом.\nБлагодаря ростущему спросу на программные продукты компании и их первокласному качеству, компания EasyStars стремительно завоевала внимание мирового бизнес сообщества.\n\nС момента основания, компанией:\n• Выпущено 4 революционных сервиса и 14 уникальных программных продуктов\n• Произведена глобальная  капитализация и выпуск цифровых акций\n• Реализована личная автономная экономика \n• Введена в финансовой оборот собственная крипто валюта.\n\nМонеты TopCoin (tc) и LeadCoin (lc) \n\nВ январяе 2021 года, благодаря ребрендингу, компания переименовалась в "Quasar Technology" и перешла на новую модель финансового управления (смена маркетинга).\n\nСегодня компания Quasar Technology является разработчиком высокотехнологичных бизнес  продуктов. \n\nРеволюционные решения программных инженеров Quasar Technology, сделали компанию мировым лидером на рынке "Information Business Technology", а фундаментальные принципы социальной инженерии, заложенные в основу выпускаемых продуктов, сделали их доступными, эффективными и простыми в использовании.\n\nФактически освободив пользователя от временных финансовых трат на различные расходные материалы, за короткий срок, Quasar Technology стала второй семьёй для партнеров из более чем 40 стран мира.\n\nУникальные технологии, сервисы и продукты открыли безграничные возможности  перед человечеством!\n\nОзнакомиться с маркетингом, функционалом сервисов и программных продуктов компании, можно перейдя в раздел "Сервисы и маркетинг"';
    
        await bot.sendPhoto(msg.chat.id, `${__dirname}/commands/static/img/about_company.jpg`)

        bot.sendMessage(msg.chat.id, caption, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'main'}]
                ]
            }
        })
    
    } else if (action === 'get_license') {
        await require('./commands/license/get_license')(bot,msg);
    } else {
        let res = await services(action, {
            msg,
            opts,
            text,
            bot
        })

        if (res !== undefined) {
            text = res.text;
            opts = res.opts;
        }
    }
    if (text !== "" && text !== undefined) {
        bot.editMessageText(text, opts);
    }
});

bot.on("polling_error", (err) => console.error(err));

bot.on('new_chat_members', async msg => {
    const get_text = `SELECT msg_text, active FROM chats WHERE chat_id = '${msg.chat.id}'`;

    let res = await client.query(get_text);

    if (msg.new_chat_participant.username === "quasar_infobot" || res.rowCount === 0) {
        console.log('lol')
        const chatDoesNotExist = `SELECT * FROM chats WHERE chat_id = '${msg.chat.id}'`;

        const res = await client.query(chatDoesNotExist);

        if (res.rowCount > 0) {
            return;
        }

        const default_text = '&&&, привет!';
        const query = `INSERT INTO chats (chat_id, msg_text, active, name) VALUES ('${msg.chat.id}', '${default_text}', true, '${msg.chat.title}')`;

        client.query(query);
        if (msg.new_chat_participant.username === "quasar_infobot") {
            return;
        }
        res = await client.query(get_text);
    }

    let post = res.rows[0];

    if (post.active) {
        let text = post.msg_text;
        text = text.replace('&&&', '@' + msg.new_chat_participant.username)
        bot.sendMessage(msg.chat.id, text);
        return;
    }
    
})

bot.on('message', message => {
    if (message.chat.type !== 'private') return;
    if(isSendingMessage){
        const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${message.chat.id}'`;

        client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }

            if(res.rows[0].is_admin){
                sendConfirmationMessage(message);
            }
            else{
                bot.sendMessage(message.chat.id, 'Вы не можете отправлять сообщения, поскольку не являетесь админом');
            }
        });
    } else if (isCheckingUser) {
        isCheckingUser = false;
        let text = '';
        let opts = {};
        opts.reply_markup = JSON.stringify({
            inline_keyboard: [
                [{ text: 'назад', callback_data: 'admin_panel' }]
            ]
        });
        let username = message.text;
        if (username[0] === "@") {
            username = username.substring(1);
        }
        console.log(username)
        const query = `SELECT * FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

        client.query(query, async (err,res) => {
            if (err) {
                //console.error(err);
                text = 'Произошла ошибка'
                bot.sendMessage(message.chat.id, text, opts)

                return
            }

            if (res.rowCount === 0) {
                text = `Пользователя с ником ${username} не существует`;
            } else {
                for (let i = 0; i < res.rowCount; i++) {
                    let inviter;
                    if (res.rows[i].ref_id !== 0) {
                        let query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = ${res.rows[i].ref_id}`
                        inviter = await client.query(query);
                        if (inviter.rowCount === 0) {
                            inviter = 'Похоже у пользователя нет пригласителя'
                        } else {
                            inviter = inviter.rows[0].username
                        }
                    } else {
                        inviter = 'Похоже у пользователя нет пригласителя '
                    }
                    text += `ID: ${res.rows[i].id}\nИмя пользователя: ${res.rows[i].username}\nChat ID: ${res.rows[i].chat_id}\nЭто админ: ${res.rows[i].is_admin}\nСигнатура для оплаты: ${res.rows[i].sign}\nПргласитель: ${inviter}\n\nОплачено: ${parseInt((new Date()-res.rows[i].last_pay)/(24*3600*1000)) <= 30 ? 'Оплачено' : 'Не оплачено'}`
                }
            }
            bot.sendMessage(message.chat.id, text, opts)

        });

    } else if (isSendingMessageNews) {
        const query = `SELECT * FROM quasar_telegrambot_users_new WHERE chat_id = '${message.chat.id}'`;

        client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }

            if(res.rows[0].is_admin){
                sendConfirmationMessage(message, true);
            }
            else{
                bot.sendMessage(message.chat.id, 'Вы не можете отправлять сообщения, поскольку не являетесь админом');
            }
        });
    }
});

const sendConfirmationMessage = (message, isNews=false) => {
    const send_opts = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Да', callback_data: isNews ? 'new_news' : 'send' }],
                [{ text: 'Нет', callback_data: 'deny' }]
            ]
        })
    }

    if (isNews) {
        if(message.photo && message.photo[0] && message.photo[0].file_id){
            news = {
                photo_id: message.photo[0].file_id,
                caption: message.caption
            }
        }
        else{
            news = {
                text: message.text
            }
        }
    }

    if(message.photo && message.photo[0] && message.photo[0].file_id){
        sendMsgMass = chat_id => bot.sendPhoto(chat_id, message.photo[0].file_id, { caption: message.caption });
    }
    else{
        sendMsgMass = chat_id => bot.sendMessage(chat_id, message.text);
    }

    sendMsgMass(message.chat.id);
    bot.sendMessage(message.chat.id, isNews ? 'Сделать новость?' : 'Сделать рассылку?', send_opts);
}

module.exports = bot
