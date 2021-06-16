const fs = require('fs');
const client = require('../../../db');
const refresh_schedule = require('../../../utils/schedule/schedule');

module.exports = async (req, res) => {
    let {
        text,
        img,
        date,
        chats
    } = req.body;

    if (img) {
        const random = Math.floor(Math.random() * 10000000);
        base64ToImg(random, img);

        const query = `INSERT INTO newsletters (msg_text, chat_ids, img, send_time) VALUES ('${text}', '{${chats.join(', ')}}', '${random}.jpg', '${date.replace(' ', 'T')}')`;

        client.query(query);
    } else {
        const query = `INSERT INTO newsletters (msg_text, chat_ids, send_time) VALUES ('${text}', '{${chats.join(', ')}}', '${date.replace(' ', 'T')}')`;

        await client.query(query);

        refresh_schedule()
    }

    

    res.send('ok')
}

const base64ToImg = (fileName, image) => {
    if(image){
        const base64Data = image.substring(22);
        const path = `${__dirname.replace('/server/controllers/admin-panel', '/utils/schedule/img/')}${fileName}.jpg`;

        fs.writeFileSync(path, base64Data, 'base64');

        return path
    }
    else return ''
}