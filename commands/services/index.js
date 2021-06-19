const service_check = require("./service_check");
const pay = require("../account/pay");

module.exports = async (action, data) => {
    let sending_msg = {
        opts: data.opts
    }
    if (action === 'service_connect') {
        return service_check(data, 'pay_connect', 'Connect');
    }else if (action === 'service_qcloud') {
        return service_check(data, 'pay_qcloud', 'QCloud', 'qcloud_pay');
    }else if (action === 'service_message') {
        return service_check(data, 'pay_message', 'Quasar Message', 'message_pay');
    }else if (action === 'service_franchise') {
        return service_check(data, 'pay_franchise', 'Franchise', 'franchise_pay');
    }else if (action === 'service_insta_comment') {
        return service_check(data, 'pay_insta_comment', 'Insta Comment', 'insta_comment_pay');
    }else if (action === 'service_insta_lead') {
        return service_check(data, 'pay_insta_lead', 'Insta Lead', 'insta_lead_pay');
    }else if (action === 'service_skype_lead') {
        return service_check(data, 'pay_skype_lead', 'Skype Lead', 'skype_lead_pay');
    }else if (action === 'service_skype_reg') {
        return service_check(data, 'pay_skype_reg', 'Skype Reg', 'skype_reg_pay');
    }else if (action === 'service_tele_lead') {
        return service_check(data, 'pay_tele_lead', 'Tele Lead', 'tele_lead_pay');
    }else if (action === 'service_vk_lead') {
        return service_check(data, 'pay_vk_lead', 'VK Lead', 'vk_lead_pay');
    }else if (action === 'service_vk_reg') {
        return service_check(data, 'pay_vk_reg', 'VK Reg', 'vk_reg_pay');
    } else if (action === 'service_autopilot') {
        return service_check(data, 'pay_autopilot', 'Autopilot', 'autopilot_pay');
    } else if (action === 'service_insta_king') {
        return service_check(data, 'pay_insta_king', 'Insta King', 'insta_king_pay');
    }
    
    else if (action === 'pay_connect') {
        const res = await pay(data.msg,data.bot);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_connect'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_qcloud') {
        const res = await pay(data.msg,data.bot,'qcloud_pay',700);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_qcloud'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_message') {
        const res = await pay(data.msg,data.bot,'message_pay',600);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_message'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_franchise') {
        const res = await pay(data.msg,data.bot,'franchise_pay',400);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_franchise'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_insta_comment') {
        const res = await pay(data.msg,data.bot,'insta_comment_pay',300);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_insta_comment'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_insta_lead') {
        const res = await pay(data.msg,data.bot,'insta_lead_pay',375);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_insta_lead'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_skype_lead') {
        const res = await pay(data.msg,data.bot,'skype_lead_pay',250);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_skype_lead'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_skype_reg') {
        const res = await pay(data.msg,data.bot,'skype_reg_pay',150);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_skype_reg'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_tele_lead') {
        const res = await pay(data.msg,data.bot,'tele_lead_pay',900);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_tele_lead'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_vk_lead') {
        const res = await pay(data.msg,data.bot,'tele_lead_pay',200);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_vk_lead'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_vk_reg') {
        const res = await pay(data.msg,data.bot,'skype_reg_pay',230);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_vk_reg'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_autopilot') {
        const res = await pay(data.msg,data.bot,'autopilot_pay',300);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_autopilot'}]
                ]
            };
        }
        return sending_msg;
    }else if (action === 'pay_insta_king') {
        const res = await pay(data.msg,data.bot,'skype_insta_king',420);
        if (res !== true) {
            sending_msg.text = res;
            sending_msg.opts.reply_markup = {
                inline_keyboard: [
                    [{text: 'Назад', callback_data: 'service_insta_king'}]
                ]
            };
        }
        return sending_msg;
    }

    else if (action.split('_')[0] === 'accruals') {
        let service = action.split('_');

        service.shift();

        service = service.join("_");

        return await require('../../commands/accruals/accruals')(data, service);
    }

    else if (action.split('_')[0] === 'marketing') {
        let service = action.split('_');

        service.shift();
        
        service = service.join("_");

        return await require('./marketings')(data, service);
    }
}