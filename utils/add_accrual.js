const client = require('../db');
const axios = require('axios');
const token = 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31';

module.exports = (username, amount, service, send_to_site = true) => {
    let currency = 'RUB';
    if (service === 'last_pay') {
        service = 'connect';
        currency = 'USD';
    }
    let query = `INSERT INTO payments_history (marketing, amount, user_id, currency) VALUES ('${service}', ${amount}, (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'), '${currency}');`;

    client.query(query);

    if (send_to_site) {
        username = '@' + username;

        let data = {};
        data[username] = {};
        data[username][currency.toLocaleLowerCase()] = amount;

        console.log(data);

        axios({
            method: 'post',
            url: 'https://api.quasaria.ru/api/pay/add_balance',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: `token=${encodeURIComponent(token)}&json=${JSON.stringify(data)}`,
        })
            .catch((err) => {
                console.error(err);
            })
            .then((res) => {
                console.log(res.data);
            });
    }
};
