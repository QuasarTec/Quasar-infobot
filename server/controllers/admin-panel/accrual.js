const add_accrual = require("../../../utils/add_accrual");

module.exports = (req, res) => {
  var { usernames, amount, services } = req.body;

  let new_services = [];

  for (var i = 0; i < Object.keys(services).length; i++) {
    if (services[Object.keys(services)[i]]) {
      new_services.push(Object.keys(services)[i]);
    }
  }

  usernames.forEach((el) => {
    for (let i = 0; i < new_services.length; i++) {
      add_accrual(el, Number(amount), new_services[i]);
    }
  });
};
