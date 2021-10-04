const services = require('../../../commands/services');
const client = require('../../../db');
const pay_distrib = require('../../../utils/pay_distrib');

module.exports = async (req, res, date) => {
    var { usernames, services } = req.body;

    var query;

    if (req.body.all_users === true) {
        if (services.connect) {
            query = `UPDATE quasar_telegrambot_users_new SET last_pay = ${date};`;
            client.query(query);
        }
        if (check_services(services)) {
            query = query_sets_for_marketings(services, date) + ';';
            client.query(query);
        }
        return res.send('Успешно');
    }

    if (services.connect) {
        query = `UPDATE quasar_telegrambot_users_new SET last_pay = ${date === 'Null' ? 'Null' : `'${date}'`
            }`;

        query += ' WHERE ';

        for (let i = 0; i < usernames.length; i++) {
            const el = usernames[i];
            if (i === usernames.length - 1) {
                query += `username = '${el}';`;
            } else {
                query += `username = '${el}' OR `;
            }
        }

        client.query(query);
    }

    if (check_services(services)) {
        query = query_sets_for_marketings(services, date);

        query += ' WHERE ';

        for (let i = 0; i < usernames.length; i++) {
            const username = usernames[i];
            if (i === usernames.length - 1) {
                query += `user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}');`;
            } else {
                query += `user_id = (SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}') OR `;
            }
        }

        client.query(query);
    }

    if (date === 'Null') {
        return res.send('ok');
    }
    console.log(usernames)
    for (let i = 0; i < usernames.length; i++) {
        const get_id_query = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${usernames[i]}'`;

        let res = await client.query(get_id_query);

        if (res.rowCount === 0) {
            let create_new_user = `INSERT INTO quasar_telegrambot_users_new (username, last_pay) VALUES ('${usernames[i]}', '${date}')`;

            await client.query(create_new_user);

            continue;
        }

        let services_list = Object.keys(services);

        let activate_services = [];

        for (let j = 0; j < services_list.length; j++) {
            if (services[services_list[j]]) {
                if (services_list[j] === 'connect') {
                    services_list[j] = 'last_pay';
                } else {
                    services_list[j] += '_pay';
                }
                activate_services.push(services_list[j]);
            }
        }


        if (req.body.distrib) {
            for (let index = 0; index < activate_services.length; index++) {
                await pay_distrib(res, activate_services[index]);
                await sleep(5000)
            }
        }
    }

    return res.send('ok');
};

const query_sets_for_marketings = (services, date) => {
    var keys = Object.keys(services);

    const index = keys.indexOf('connect');
    if (index > -1) {
        keys.splice(index, 1);
    }

    var query = `UPDATE marketings SET `;
    keys.forEach((el) => {
        if (services[el]) {
            query += `${el + '_pay'} = ${date}, `;
        }
    });

    query = query.slice(0, -2);

    return query;
};

const check_services = (services) => {
    var result = false;

    var keys = Object.keys(services);

    const index = keys.indexOf('connect');
    if (index > -1) {
        keys.splice(index, 1);
    }

    keys.forEach((el) => {
        if (services[el]) {
            result = true;
        }
    });

    return result;
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}