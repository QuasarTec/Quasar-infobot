const service_check = require('./service_check');


module.exports = async (data) => {
    return service_check(data, 'pay_tele_lead', 'Tele Lead', 'tele_lead_pay');
}