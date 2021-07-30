const client = require("../../../../db");

module.exports = async (req, res) => {
    let {
        ref_uuid
    } = req.query;

    if (ref_uuid === undefined) {
        return res.json({
            status: "error",
            error: "'ref_uuid' is not defined"
        })
    }

    const ref_id_query = `SELECT ref_id FROM quasar_telegrambot_users_new WHERE ref_uuid = '${ref_uuid}'`;

    let ref_id = await client.query(ref_id_query);

    if (ref_id.rowCount === 0) {
        return res.json({
            status: "error",
            error: "Not Found"
        })
    }

    const query = `SELECT username FROM quasar_telegrambot_users_new WHERE id = ${ref_id.rows[0].ref_id}`;

    let response = await client.query(query);

    if (response.rowCount === 0) {
        return res.json({
            status: "error",
            error: "Mentor not found"
        })
    }

    res.json({
        status: "ok",
        mentor: `@${response.rows[0].username}`
    })
}