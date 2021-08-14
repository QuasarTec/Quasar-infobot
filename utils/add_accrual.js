const client = require('../db');
const axios = require('axios');
const token = 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31';

module.exports = async (username, amount, service, send_to_site = true) => {
    let currency = 'RUB';
    if (service === 'last_pay') {
        service = 'connect';
        currency = 'USD';
    }
    let query = `INSERT INTO payments_history (marketing, amount, user_id, currency) VALUES ('${service}', ${amount}, (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'), '${currency}');`;
    client.query(query);

    if (send_to_site) {
        const get_ref_uuid = `SELECT ref_uuid FROM quasar_telegrambot_users_new WHERE username = '${username}';`;

        const ref_uuid = (await client.query(get_ref_uuid)).rows[0].ref_uuid;

        if (ref_uuid) {
            var data = [
                {
                    ref_uuid,
                    cur: {},
                },
            ];
            data[0]['cur'][currency.toLocaleLowerCase()] = amount;
        } else {
            var data = [
                {
                    username: '@' + username,
                    cur: {},
                },
            ];
            data[0]['cur'][currency.toLocaleLowerCase()] = amount;
        }

        axios({
            method: 'post',
            url: 'https://api.quasaria.ru/api/pay/add_balance',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: `token=${encodeURIComponent(token)}&json=${JSON.stringify(data)}`,
        })
            .catch((err) => {
                console.error(err);
            })
    }
};
