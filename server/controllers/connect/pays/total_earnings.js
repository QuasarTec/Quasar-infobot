const client = require('../../../../db');

module.exports = async (req, res) => {
    let { ref_uuid } = req.query;

    let get_total_earnings = `SELECT sum(amount) AS total FROM payments_history WHERE marketing = 'connect' AND amount > 0 AND user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE ref_uuid = '${ref_uuid}')`;

    let earnings = await client.query(get_total_earnings);

    return res.json({
        total:
            earnings.rows[0].total === null
                ? 0
                : Number(earnings.rows[0].total === null).toFixed(2),
    });
};
