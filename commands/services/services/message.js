const service_check = require('./service_check');


module.exports = async (data) => {
    return service_check(data, 'pay_message', 'Quasar Message', 'message_pay');
}