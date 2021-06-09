const service_check = require('./service_check');


module.exports = async (data) => {
    return service_check(data, 'pay_vk_reg', 'VK Reg', 'vk_reg_pay');
}