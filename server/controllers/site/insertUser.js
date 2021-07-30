const client = require("../../../db");

module.exports = async (req, res) => {
    let {
        username,
        ref_uuid
    } = req.body;

    if (username[0] === "@") {
        username = username.substring(1)
    }

    const check_user_exist = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}' OR ref_uuid = '${ref_uuid}'`;

    const user = await client.query(check_user_exist);
    
    if (user.rowCount !== 0) {
        return res.json({
            status: "error",
            text: "User exist"
        })
    }

    const insert_user = `INSERT INTO quasar_telegrambot_users_new (username, ref_uuid) VALUES ('${username
    }', '${ref_uuid}')`;

    client.query(insert_user);

    return res.json({
        status: "ok"
    })
}