const service_check = require('./service_check');


module.exports = async (data) => {
    return service_check(data, 'pay_vk_lead', 'VK Lead', 'vk_lead_pay');
}