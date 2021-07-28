const client = require("../../../../db");
const referrals = require('../../../../utils/findRefs');

module.exports = async (req, res) => {
    let {
        username
    } = req.query;

    if (username === undefined) {
        return res.json({
            status: "error",
            error: "'username' is not defined"
        })
    }

    if (username[0] === "@") {
        username = username.substring(1)
    }

    let query = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

    const id = await client.query(query);

    if (id.rowCount === 0) {
        return res.json({
            status: "error",
            error: "Not Found"
        })
    }

    const response = referrals.transformRefs(
        await referrals.getAllReferals([id.rows[0].id], 9)
    );

    return res.json({
        status: "ok",
        count: response.flat().length === undefined ? 0 : response.flat().length
    })
}