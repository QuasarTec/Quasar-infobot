const client = require('../../../../db');
let token = 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31';
const axios = require('axios');

module.exports = async (req, res) => {
    let {
        ref_uuid,
        username
    } = req.query

    if (ref_uuid === undefined) {
        res.json({
            status: "error",
            error: "ref_uuid is not defined"
        })
    }

    if (username === undefined) {
        res.json({
            status: "error",
            error: "username is not defined"
        })
    }

    if (username[0] === "@") {
        username = username.substring(1)
    }

    let response = await axios({
        method: 'post',
        url: 'https://api.quasaria.ru/api/pay/get_pay_link',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `token=${encodeURIComponent(token)}&ref_uuid=${encodeURIComponent(
            ref_uuid
        )}&m_curr=USD&m_amount=12&desc=last_pay`,
    }).catch(err => res.json({
        status: "error",
        error: err
    }));
    if (response === undefined) {
        return;
    }
    if (response.data.status === 'error') {
        res.json({
            status: 'error',
            error: 'Not found on site',
        });
        return true;
    } else if (response.data.status === 'success') {
        const userExist = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}' OR ref_uuid = '${ref_uuid}'`;

        const user = await client.query(userExist);

        if (user.rowCount === 0) {
            return res.json({
                status: 'error',
                error: 'Not Found',
            });
        }

        query = `UPDATE quasar_telegrambot_users_new SET sign = '${response.data.response.sing}' WHERE username = '${username}' OR ref_uuid = '${ref_uuid}';`;

        client.query(query, err => {
            if (err) {
                return res.json({
                    status: 'error',
                    error: "query error",
                });
            }
            return res.json({
                status: "ok",
                link: response.data.response.link
            })
        });
    }
};
