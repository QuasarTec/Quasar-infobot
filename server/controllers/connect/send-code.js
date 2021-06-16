const client = require("../../../db")


module.exports = async (req, res, bot) => {
    const {
        username
    } = req.body;

    if (username[0] === '@') username = username.substring(1);

    const checkUserExist = `SELECT chat_id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    let user = await client.query(checkUserExist);

    if (user.rowCount === 0) return res.json({
        status: 'Not Found'
    });

    let code = await generateCode();

    const updateUserCode = `UPDATE quasar_telegrambot_users_new SET code = ${code} WHERE chat_id = ${user.rows[0].chat_id}`;

    client.query(updateUserCode);

    bot.sendMessage(user.rows[0].chat_id, `Ваш код подтверждения: ${code}`);

    res.json({
        status: 'OK'
    })
}

const generateCode = async () => {
    let code = Math.floor(Math.random() * 1000000);

    let checkCode = `SELECT id FROM quasar_telegrambot_users_new WHERE code = ${code}`;

    let res = await client.query(checkCode);

    if (res.rowCount === 0) {
        return code;
    }

    return generateCode();
}