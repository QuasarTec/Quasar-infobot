const client = require('../../db');
const path = require('path');
const fs = require('fs');

module.exports = async (data, callback_name, name, db_field_name = 'last_pay') => {
    let sending_msg = {
        opts: data.opts
    }

    let query;

    if (db_field_name === 'last_pay') {
        query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE chat_id = '${data.msg.chat.id}';`;
    } else {
        query = `SELECT m.${db_field_name} FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${data.msg.chat.id}';`;
    }


    let res = await client.query(query);
    
    if (res.rowCount === 0 || res.rows[0][db_field_name] === null) {
        sending_msg.opts.reply_markup = {
            inline_keyboard: [
                [{text: 'Маркетинг', callback_data: `marketing_${callback_name.replace('pay_', '')}`}],
                //[{text: 'Оплата маркетинга', callback_data: callback_name}],
                [{text: 'Назад', callback_data: 'start'}],
                [{text: 'Главная', callback_data: 'main'}]
            ]
        }
    } else if (res.rowCount !== 0 && parseInt((new Date()-res.rows[0][db_field_name])/(24*3600*1000)) > 30) {
        sending_msg.text += '\nВремя вашей подписки истекло, для использования сервиса Connect необходимо продлить подписку';
        sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Маркетинг', callback_data: `marketing_${callback_name.replace('pay_', '')}`}],
                    [{text: 'Оплата маркетинга', callback_data: callback_name}],
                    [{text: 'Назад', callback_data: 'services'}],
                    [{text: 'Главная', callback_data: 'main'}]
                ]
        }
    } else {
        let query = `SELECT username FROM quasar_telegrambot_users_new WHERE chat_id = ${data.msg.chat.id};`

        let res = await client.query(query);
        
        sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Маркетинг', callback_data: `marketing_${callback_name.replace('pay_', '')}`}],
                    [{text: 'Визульный просмотр рефраллов', url: `https://matrix.easy-stars.ru/bot/referrals-vizualization?username=${res.rows[0].username}&type=${db_field_name}`}],
                    [{text: 'Посмотреть начисления', callback_data: `accruals_${db_field_name}`}],
                    [{text: 'Назад', callback_data: 'services'}],
                    [{text: 'Главная', callback_data: 'main'}]
                ]
        }
    }

    let pathToPhotoCaption = path.join(__dirname, '..', '/static/html/services/photo_caption', db_field_name.replace('_pay', '.html'));

    let pathToFileCaption = path.join(__dirname, '..', '/static/html/services/file_caption', db_field_name.replace('_pay', '.html'));

    fs.readFile(pathToFileCaption, async (err, text) => {
        let photo_opts = {
            parse_mode: 'HTML',
        }
        
        if (err) {
            fs.readFile(pathToPhotoCaption, async (err, text) => {
                if (err) throw err;
        
                let pathToPhoto = __dirname.replace('services', `static/img/services/${db_field_name.replace('_pay', '.jpg')}`);
        
                photo_opts.reply_markup = sending_msg.opts.reply_markup;
                photo_opts.caption = text;

                await data.bot.sendPhoto(data.msg.chat.id, pathToPhoto, photo_opts);
            })
            return;
        }

        fs.readFile(pathToPhotoCaption, async (err, text) => {
            if (err) throw err;
    
            let pathToPhoto = __dirname.replace('services', `static/img/services/${db_field_name.replace('_pay', '.jpg')}`);
    
            await data.bot.sendPhoto(data.msg.chat.id, pathToPhoto, photo_opts);
        })

        

        let pathToFile = __dirname.replace('services', `static/rar/services/${name.replace(' ', '')}.rar`);

        let opts = {
            parse_mode: 'HTML',
            caption: text,
            reply_markup: sending_msg.opts.reply_markup
        }
        if (err) {
            return;
        }
        await data.bot.sendDocument(data.msg.chat.id, pathToFile, opts);
        
    })

    return;
}