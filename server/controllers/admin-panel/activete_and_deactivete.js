const client = require("../../../db");

module.exports = (req, res, date) => {
  var { usernames, services } = req.body;

  var query;

  if (req.body.all_users === true) {
    if (services.connect) {
      query = `UPDATE quasar_telegrambot_users_new SET last_pay = ${date};`;
      client.query(query);
    }
    if (check_services(services)) {
      query = query_sets_for_marketings(services, date) + ";";
      client.query(query);
    }
    return res.send("Успешно");
  }

  if (services.connect) {
    query = `UPDATE quasar_telegrambot_users_new SET last_pay = ${date}`;

    query += " WHERE ";

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

    query += " WHERE ";

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

  return res.send("ok");
};

const query_sets_for_marketings = (services, date) => {
  var keys = Object.keys(services);

  const index = keys.indexOf("connect");
  if (index > -1) {
    keys.splice(index, 1);
  }

  var query = `UPDATE marketings SET `;
  keys.forEach((el) => {
    if (services[el]) {
      query += `${el + "_pay"} = ${date}, `;
    }
  });

  query = query.slice(0, -2);

  return query;
};

const check_services = (services) => {
  var result = false;

  var keys = Object.keys(services);

  const index = keys.indexOf("connect");
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
