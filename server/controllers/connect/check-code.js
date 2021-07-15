const client = require('../../../db');

module.exports = async (req, res) => {
    const { code } = req.body;

    const query = `SELECT username FROM quasar_telegrambot_users_new WHERE code = ${code}`;

    let userWithCode = await client.query(query);

    if (userWithCode.rowCount === 0) {
        return res.json({
            status: 'Not Found',
        });
    }

    res.json({
        status: 'OK',
        username: userWithCode.rows[0].username,
    });

    const setCodeNull = `UPDATE quasar_telegrambot_users_new SET code = Null WHERE username = '${userWithCode.rows[0].username}'`;

    client.query(setCodeNull);
};
