const commands = require('../../../../commands/index');
const client = require('../../../../db');

module.exports = async (req, res) => {
    let { ref_uuid, active } = req.query;

    if (ref_uuid === undefined) {
        return res.json({
            status: 'error',
            error: "'ref_uuid' is not defined",
        });
    }

    if (active === undefined) {
        return res.json({
            status: 'error',
            error: "'active' is not defined",
        });
    }

    if (active === 'true') {
        active = true;
    } else if (active === 'false') {
        active = false;
    } else {
        return res.json({
            status: 'error',
            error: "active can be only 'true' or 'false'",
        });
    }

    let getId = `SELECT chat_id, username FROM quasar_telegrambot_users_new WHERE ref_uuid = '${ref_uuid}'`;

    let chat_id = await client.query(getId);

    if (chat_id.rowCount === 0) {
        return res.json({
            status: 'error',
            error: 'Not Found',
        });
    }

    let msg = {
        chat: {
            username: chat_id.rows[0].username,
            id: chat_id.rows[0].chat_id,
        },
    };

    if (active) {
        return res.json({
            status: 'ok',
            text: await commands.refs.downRefferals(msg, false, 'last_pay', true),
        });
    }

    res.json({
        status: 'ok',
        text: await commands.refs.downRefferals(msg),
    });
};
