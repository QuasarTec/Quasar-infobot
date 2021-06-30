const express = require('express');
const router = express.Router();

const findRefs = require('../../utils/findRefs');
const transformByDeactivated = require('../../utils/transformByDeactivated');
const pay_distrib = require('../../utils/pay_distrib');
const { default: axios } = require('axios');
const fs = require('fs');
const client = require('../../db');
const bot = require('../../bot');
const adminPanel = require('./admin-panel/adminPanel');
const redirect = require('./redirect');

<<<<<<< HEAD
router.use(redirect);
=======
router.use(redirect)
>>>>>>> 62e31abc236f76d63cbfe1fbe849ada25c9d7725
router.use(adminPanel);

router.post('/users/check-on-payed', async (req, res) => {
  require('../controllers/checkOnPayed')(req, res);
});

router.post('/connect/check-code', async (req, res) => {
  require('../controllers/connect/check-code')(req, res);
});

router.post('/connect/send-code', async (req, res) => {
  require('../controllers/connect/send-code')(req, res, bot);
});

router.get('/accruals/get-accruals', (req, res) => {
  require('../controllers/accruals/get_accruals')(req, res);
});

router.post('/message', async (req, res) => {
  const { usernames, text, image } = req.body;

  const random = Math.floor(Math.random() * 100000);
  const path = base64ToImg(random, image);

  for (username of usernames) {
    const parsedUsername = username[0] === '@' ? username.substring(1) : username;
    const id = await getUserId(parsedUsername);

    if (id && image) bot.sendPhoto(id, path, { caption: text });
    else if (id) bot.sendMessage(id, text);
  }

  if (image) {
    fs.unlink(path, (err) => {
      if (err) console.error(err);
    });
  }

  res.send({ msg: 'Рассылка сделана' });
});

router.get('/referrals-vizualization', async (req, res) => {
  let root = req.query.username;
  let type = req.query.type;
  if (root === undefined) {
    res.send(
      'Ошибка! Похоже вы попали не туда\n<a href="https://meet.qtconnect.ru" target="_blank">Главная</a>'
    );
    return;
  }

  if (type === undefined) {
    type = 'last_pay';
  }

  let query = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${root}';`;

  let response = await client.query(query);

  if (response.rowCount === 0) {
    res.send(
      `Ошибка! Мы не можем найти пользователя с ником @${root}\n<a href="https://meet.qtconnect.ru" target="_blank">Главная</a>`
    );
    return;
  }

  var levels;

  if (type === 'last_pay' || type === 'qcloud_pay') {
    levels = 9;
  } else if (type === 'message_pay' || type === 'franchise_pay') {
    levels = 7;
  } else {
    levels = 5;
  }

  let json = {
    id: 'root',
    name: root,
    date: {},
    children: await findRefs.getAllReferals([response.rows[0].id], levels, true, type),
  };

  json = transformByDeactivated(json);

  json = JSON.stringify(json);

  let html = fs.readFileSync('./static/refs/index.html');

  html = html.toString().split("'importJsonHere'");

  res.send(html[0] + json + html[1]);
});

router.post('/pay/confirm', (req, res) => {
  let { sign, desk } = req.body;

  let user;

  if (sign === undefined) {
    return res.send('sign required');
  }

  if (desk === undefined) {
    desk = 'last_pay';
  }

  let query = `SELECT chat_id, id, ref_id, username FROM quasar_telegrambot_users_new WHERE sign = '${sign}'`;

  client.query(query, async (err, response) => {
    if (err) {
      res.send(err);
      console.error(err);
      return;
    }

    if (response.rowCount === 0) {
      res.json({
        status: 'User with this signature not found',
      });
      return;
    }

    let query = `SELECT id FROM marketings WHERE user_id = ${response.rows[0].id};`;

    client.query(query, async (err, res) => {
      if (err) {
        console.error(err);
      }

      if (res.rowCount === 0) {
        const query = `INSERT INTO marketings (username, user_id) VALUES ((SELECT username FROM quasar_telegrambot_users_new WHERE id = ${response.rows[0].id}), ${response.rows[0].id})`;

        await client.query(query);
      }
    });

    if (desk === 'last_pay') {
<<<<<<< HEAD
      query = `UPDATE quasar_telegrambot_users_new SET last_pay = '${new Date().toUTCString()}', sign = Null WHERE chat_id = '${
        response.rows[0].chat_id
      }'`;
    } else {
      query = `UPDATE marketings SET ${desk} = '${new Date().toUTCString()}' WHERE user_id = ${
        response.rows[0].id
      };`;
=======
      query = `UPDATE quasar_telegrambot_users_new SET last_pay = Now(), sign = Null WHERE chat_id = '${response.rows[0].chat_id}'`;
    } else {
      query = `UPDATE marketings SET ${desk} = Now() WHERE user_id = ${response.rows[0].id};`;
>>>>>>> 62e31abc236f76d63cbfe1fbe849ada25c9d7725
    }

    client.query(query, (err) => {
      if (err) {
        res.send(err);
        console.error(err);
        return;
      }

      bot.sendMessage(
        response.rows[0].chat_id,
        'Оплата прошла успешно!\nВы можете пользоваться технологией Connect'
      );

      //Бесплатные пробный период
      let query = `SELECT m.*, u.last_pay FROM marketings m left join quasar_telegrambot_users_new u on u.id=m.user_id WHERE u.chat_id = '${response.rows[0].chat_id}'`;

      client.query(query, async (err, res) => {
        if (err) {
          res.send(err);
          console.error(err);
          return;
        }

        //Получаем список непроплаченных маркетингов
        var test_period_sevices = [];

        if (res.rowCount === 0) {
          let query = `INSERT INTO marketings (user_id) VALUES ((SELECT id FROM quasar_telegrambot_users_new WHERE chat_id = '${response.rows[0].chat_id}'))`;
          client.query(query);
          test_period_sevices = [
            'qcloud_pay',
            'franchise_pay',
            'message_pay',
            'insta_comment_pay',
            'insta_lead_pay',
            'skype_lead_pay',
            'skype_reg_pay',
            'tele_lead_pay',
            'vk_lead_pay',
            'vk_reg_pay',
            'insta_king_pay',
          ];
        } else {
          let sevices = Object.keys(res.rows[0]);

          sevices.forEach((service) => {
            if (
              service !== 'id' &&
              service !== 'user_id' &&
              (res.rows[0][service] === null ||
                parseInt((new Date() - res.rows[0][service]) / (24 * 3600 * 1000)) > 30)
            ) {
              test_period_sevices.push(service);
            }
          });
        }

        //Оплачиваем их а 2 недели назад

        query = `UPDATE marketings SET `;

        let two_weeks_ago = new Date(new Date().getTime() - 2 * 7 * 24 * 3600 * 1000).toUTCString();

        if (test_period_sevices.length === 0) {
          return;
        }

        test_period_sevices.forEach((service) => {
          if (service === 'last_pay') {
            let query = `UPDATE quasar_telegrambot_users_new SET last_pay = '${new Date(
              new Date().getTime() - 2 * 7 * 24 * 3600 * 1000
            ).toUTCString()}', `;

            client.query(query);
          } else {
            query += `${service} = '${two_weeks_ago}', `;
          }
        });

        query = query.slice(0, -2);

        query += ` WHERE user_id = ${response.rows[0].id};`;

        await client.query(query);
      });

      bot.sendMessage(
        response.rows[0].chat_id,
        'В честь запуска бота, мы дарим вам пробный период, на все сервисы компании на срок в 2 недели!'
      );

      ///А дальше уже не бесплатный пробный период
      res.json({
        status: 'Succesfully',
      });
    });

    if (response.rows[0].ref_id !== null) {
      pay_distrib(response, desk);
      return;
    }

    const params = {
      action: 'get',
      token: 'D!3%26%23!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%%23%@4112dhas91^^^^31',
      by: 'username',
      by_text: response.rows[0].username,
    };

    const resp = await axios
      .get(
        `https://api.easy-stars.ru/api/query/user/get?action=${params.action}&token=${params.token}&by=${params.by}&by_text=${params.by_text}`
      )
      .catch((err) => console.error(err));
    if (resp.data.status === 'error') {
      bot.sendMessage(
        response.rows[0].chat_id,
        `Пользователя с ником @${params.by_text} на сайте https://easy-stars.ru не найдено.\nПроверьте ники, на идентичность.\nЕсли вы уверены, что зарегестрировались, под вашим телеграм ником, обратитесь за помощью на сайте`
      );
      return;
    }

    let inviter = resp.data.result.User.inviter;

    if (inviter[0] === '@') {
      inviter = inviter.substring(1);
    }

    let get_inviter_id = `SELECT chat_id FROM quasar_telegrambot_users_new WHERE Lower(username) = '${inviter.toLowerCase()}'`;

    let inviter_id = await client.query(get_inviter_id);

    if (inviter_id.rowCount === 0) {
      return;
    }

    let chat_id = inviter_id.rows[0].chat_id;

    bot.sendMessage(
      chat_id,
      `По вашей реферальной ссылке был заргестрирован пользователь @${response.rows[0].username}`
    );

    query = `SELECT id FROM quasar_telegrambot_users_new WHERE username='${inviter}'`;

    client.query(query, async (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      var inviterId;

      if (res.rowCount === 0 || res.rows[0].id === 180) {
        inviterId = await findWeakBranch(661); //Поиск слабого звена относительно аккаунта @Quasar_Company (661 - id записи Quasar_Company в бд)
      } else {
        query = `SELECT id FROM quasar_telegrambot_users_new WHERE ref_id = ${res.rows[0].id}`;
        let count_refs = await client.query(query);
        if (count_refs.rowCount >= 5) {
          inviterId = await findWeakBranch(res.rows[0].id);
        } else {
          inviterId = res.rows[0].id;
        }
      }

      query = `UPDATE quasar_telegrambot_users_new SET ref_id = ${inviterId} WHERE chat_id=${response.rows[0].chat_id}`;

      client.query(query, (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        pay_distrib(response, desk);
      });
    });
  });
});

const findWeakBranch = async (id) => {
  let refs = await findRefs.getAllReferals([id], 9);
  refs = findRefs.transformRefs(refs);

  let levels = {};

  for (let i = 0; i < 9; i++) {
    levels[i] = [];
  }

  refs.forEach((el) => {
    levels[el.level].push(el);
  });

  for (let i = 0; i < 9; i++) {
    if (levels[i].length < 5 ** (i + 1)) {
      let users_of_level = {};
      let parents = [];
      levels[i].forEach((el) => {
        if (users_of_level[el.parent] === undefined) {
          users_of_level[el.parent] = [el];
          parents.push(el.parent);
        } else {
          users_of_level[el.parent].push(el);
        }
      });
      let min_count_refs = 5;
      let min_count_refs_user;
      parents.forEach((el) => {
        if (users_of_level[el].length < min_count_refs) {
          min_count_refs = users_of_level[el].length;
          min_count_refs_user = el;
        }
      });
      let get_id_min_count_refs_user_query = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${min_count_refs_user}'`;

      let id_min_count_refs_user = await client.query(get_id_min_count_refs_user_query);

      if (id_min_count_refs_user.rowCount === 0) {
        console.error('Бля миша, что-то пошло по пизде');
        return;
      }

      return id_min_count_refs_user.rows[0].id;
    }
  }
};

router.get('/users/user-does-exist/', (req, res) => {
  let username = req.query.username;

  if (username === undefined) {
    res.json({
      userExist: 'username field empty',
    });
    return;
  }

  userDoesExist = `SELECT id FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

  client.query(userDoesExist, (err, response) => {
    if (err) {
      res.json({
        userExist: err,
      });
      throw err;
    }
    if (response.rowCount === 0) {
      res.json({
        userExist: false,
      });
    } else {
      res.json({
        userExist: true,
      });
    }
  });
});

router.get('/users/get-balance/', (req, res) => {
  let username = req.query.username;

  if (username === undefined) {
    res.json({
      userExist: 'username field empty',
    });
    return;
  }

  query = `SELECT last_pay FROM quasar_telegrambot_users_new WHERE username = '${username}'`;

  client.query(query, (err, response) => {
    if (err) {
      res.json({
        userExist: err,
      });
      throw err;
    }
    if (response.rowCount === 0) {
      res.json({
        balance: false,
      });
    } else {
      let balance =
        12 - (12 / 30) * parseInt((new Date() - response.rows[0].last_pay) / (24 * 3600 * 1000));
      res.json({
        balance: balance > 0 ? balance : 0.0,
      });
    }
  });
});

const base64ToImg = (fileName, image) => {
  if (image) {
    const base64Data = image.substring(1);
    const path = `${fileName}.jpg`;

    fs.writeFileSync(path, base64Data, 'base64');

    return path;
  } else return '';
};

const getUserId = async (name) => {
  const query = `SELECT * FROM quasar_telegrambot_users_new WHERE username='${name}'`;
  const { rows } = await client.query(query);

  return rows[0] ? rows[0]['chat_id'] : undefined;
};
module.exports = router;
