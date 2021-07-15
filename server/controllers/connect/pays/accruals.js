const client = require('../../../../db');
const add_accrual = require('../../../../utils/add_accrual');

module.exports = async (req, res) => {
    var { username, amount } = req.body;

    if (username[0] === '@') {
        username = username.substring(1);
    }

    const userExist = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    const user = await client.query(userExist);

    if (user.rowCount === 0) {
        return res.json({
            status: 'error',
            error: 'Not Found',
        });
    }

    add_accrual(username, Number(amount).toFixed(2), 'connect', false);

    return res.json({
        status: 'ok',
    });
};
