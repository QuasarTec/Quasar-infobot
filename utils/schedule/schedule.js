const client = require('../../db');
const schedule = require('node-schedule');
const fs = require('fs');

module.exports = async (bot) => {
    let query = `SELECT * FROM newsletters;`;

    let res = await client.query(query);

    let jobList = schedule.scheduledJobs;

    let keys = Object.keys(jobList);

    keys.forEach(job => {
        jobList[job].cancel()
    })

    res.rows.forEach(el => {
        if (el.msg_text === undefined && el.img === undefined) {
            return;
        }
        schedule.scheduleJob(`job-${el.id}`, el.send_time, () => {
            if (el.img) {
                el.chat_ids.forEach( async id => {
                    await bot.sendPhoto(id, `${__dirname}/img/${el.img}`, {caption: el.msg_text});
                })
                fs.unlink(`${__dirname}/img/${el.img}`, (err) => {
                    if (err) throw err;
                })  
            } else {
                el.chat_ids.forEach(id => {
                    bot.sendMessage(id, el.msg_text)
                })
            }
            const delete_task = `DELETE FROM newsletters WHERE id = ${el.id}`;

            client.query(delete_task);
        })
    })
}