const client = require('../../db');

module.exports = async (req, res) => {
    let { username, service } = req.body;

    if (service === undefined) {
        service = 'last_pay';
    }

    const query =
        service === 'last_pay'
            ? `SELECT last_pay FROM quasar_telegrambot_users_new WHERE username = '${username}'`
            : `SELECT ${service} FROM marketings WHERE user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}')`;

    let response = await client.query(query);

    if (response.rowCount === 0) {
        res.json({
            payed: false,
        });
        return;
    }
    res.json({
        payed: parseInt((new Date() - response.rows[0][service]) / (24 * 3600 * 1000)) <= 30,
    });
};
