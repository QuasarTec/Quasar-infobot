const service_check = require('./service_check');

module.exports = async (data) => {
    return service_check(data, 'pay_insta_lead', 'Insta Lead', 'insta_lead_pay');
}