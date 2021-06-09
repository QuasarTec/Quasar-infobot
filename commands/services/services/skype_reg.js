const service_check = require('./service_check');


module.exports = async (data) => {
    return service_check(data, 'pay_skype_reg', 'Skype Reg', 'skype_reg_pay');
}