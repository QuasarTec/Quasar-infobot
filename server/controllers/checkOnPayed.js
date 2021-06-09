const client = require('../../db');

module.exports = async (req, res) => {
    let { username } = req.query;

    const query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    let response = await client.query(query);

    if (response.rowCount === 0) {
        res.json({
            payed: false
        })
        return
    }
    res.json({
        payed: parseInt((new Date()-response.rows[0].last_pay)/(24*3600*1000)) <= 30
    })
}