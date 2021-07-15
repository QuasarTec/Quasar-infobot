const md5 = require('md5');
const client = require('../../../../db');

module.exports = async (req, res) => {
    let { username } = req.body;

    //Получаем id пользователя

    const get_user_id = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    let user_id = await client.query(get_user_id);

    //Проверяем на начличие
    if (user_id.rowCount === 0 || username === undefined) {
        return res.json({
            status: 'error',
            text: 'Not Found',
        });
    }

    //Делаем сообщение для зашифровки
    let message =
        username +
        ' https://www.youtube.com/watch?v=dQw4w9WgXcQ ' +
        Math.floor(Math.random() * 10000000);

    //Хэшируем
    let hash = md5(message);

    const insert_hash = `INSERT INTO redirect (user_id, hash, datetime) VALUES (${
        user_id.rows[0].id
    }, '${hash}', '${new Date().toUTCString()}')`;

    client.query(insert_hash);

    res.json({
        status: 'ok',
        hash: hash,
    });
};
