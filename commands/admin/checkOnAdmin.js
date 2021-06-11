const client = require("../../db");

module.exports = async (chat_id) => {
    const isAdmin = `SELECT is_admin FROM quasar_telegrambot_users_new WHERE chat_id = ${chat_id}`;

    const res = await client.query(isAdmin);

    return res.rowCount > 0 && res.rows[0].is_admin;
}