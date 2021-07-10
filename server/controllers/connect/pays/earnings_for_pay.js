const client = require('../../../../db');

module.exports = async (req, res) => {
    let {
        username
    } = req.query;

    if (username[0] === "@") {
        username = username.substring(1);
    }

    let get_earnings_for_pay = `SELECT sum(amount) AS total FROM payments_history WHERE marketing = 'connect' AND user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}')`;

    let earnings = await client.query(get_earnings_for_pay);

    return res.json({
        total: earnings.rows[0].total === null ? 0 : Number(earnings.rows[0].total === null).toFixed(2)
    })
}