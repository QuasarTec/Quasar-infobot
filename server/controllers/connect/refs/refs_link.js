const client = require('../../../../db');

module.exports = async (req, res) => {
    let { username } = req.query;

    console.log(username);

    if (username === undefined) {
        return res.json({
            status: 'error',
            error: "'username' is not defined",
        });
    }

    username = username.replaceAll('@', '');

    const userExist = `SELECT ref_id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    let user = await client.query(userExist);

    if (user.rowCount === 0) {
        return res.json({
            status: 'error',
            error: 'Not Found',
        });
    }

    res.json({
        status: 'ok',
        link: `https://bot.quasaria.ru/bot/referrals-vizualization?username=${username}&type=last_pay`,
    });
};
