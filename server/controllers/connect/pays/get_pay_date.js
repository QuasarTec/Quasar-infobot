const client = require('../../../../db');

const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

module.exports = async (req, res) => {
    let {
        username
    } = req.query;

    if (username[0] === "@") {
        username = username.substring(1);
    }

    let get_last_pay_date = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    let date = await client.query(get_last_pay_date);

    if (date.rowCount === 0) {
        return res.json({
            status: 'error',
            error: 'Not Found'
        })
    }

    let days_from_last_pay = parseInt((new Date() - date.rows[0].last_pay) / (24 * 3600 * 1000))

    return res.json({
        status: 'ok',
        rest_of_days: 30 - days_from_last_pay < 0 ? 0 : 30 - days_from_last_pay,
        next_pay_date: addDays(date.rows[0].last_pay, 30).toJSON().toString().slice(0, 10)
    })
}