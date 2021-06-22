const getAllInviters = require("./findInviters");
const axios = require("axios");
const token =
  "D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31";
const add_accrual = require("./add_accrual");

module.exports = (response, type) => {
  let levels, amount;

  if (type === "last_pay") {
    levles = 9;
    amount = 675;
  } else if (type === "qcloud_pay") {
    levles = 9;
    amount = 495;
  } else if (type === "message_pay") {
    levles = 7;
    amount = 400;
  } else if (type === "franchise_pay") {
    levles = 7;
    amount = 400;
  } else if (type === "insta_comment_pay") {
    levles = 5;
    amount = 210;
  } else if (type === "insta_lead_pay") {
    levles = 5;
    amount = 270;
  } else if (type === "skype_lead_pay") {
    levles = 5;
    amount = 175;
  } else if (type === "skype_reg_pay") {
    levles = 5;
    amount = 105;
  } else if (type === "tele_lead_pay") {
    levles = 5;
    amount = 630;
  } else if (type === "vk_lead_pay") {
    levles = 5;
    amount = 140;
  } else if (type === "vk_reg_pay") {
    levles = 5;
    amount = 160;
  } else if (type === "autopilot_pay") {
    levles = 9;
    amount = 115;
  } else if (type === "insta_king_pay") {
    levles = 5;
    amount = 295;
  }

  getAllInviters(response.rows[0].id, levels, type).then(async (inviters) => {
    inviters = inviters.filter((inviter) => inviter.id !== response.rows[0].id);
    for (let i = 0; i < inviters.length; i++) {
      add_accrual(
        inviters[i].username,
        +(amount / inviters.length).toFixed(2),
        type
      );
    }

    /*await axios({
            method: "post",
            url: "https://api.easy-stars.ru/api/pay/add_balance",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: `token=${encodeURIComponent(token)}&json=${JSON.stringify(data)}`
        }).catch((err) => {
            console.error(err)
        })*/
  });
  /*axios({
            url: 'https://api.easy-stars.ru/api/query/stars',

            method: 'GET',

            params: {
                    action: 'update',
                    token: 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31',
                    by: 'username',
                    by_text: '@'+response.rows[0].username,
                    product_name: 'Connect',
                    update_to: 'activate',
                    update_value: true
            }
    })*/
};
