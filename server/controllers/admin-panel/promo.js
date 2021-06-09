const client = require('../../../commands/license/mysql');

module.exports = (req, res) => {
    let {
        usernames,
        type
    } = req.body;

    var licenses;

    if (type === 'p1') {
        licenses = 500;
    } else if (type === 'p2') {
        licenses = 700;
    } else if (type === 'p3') {
        licenses = 1000;
    }

    usernames.forEach(el => {
        const query = `INSERT INTO Licensi (\`Username\`, \`Timeset\`,\` Activate\`, \`ActivateLicens\`, \`LimitDay\`, \`Limit\`) VALUES ('${el}', ${new Date().toUTCString()}, 1, true, 40, ${licenses});`;

        //client.query(query);
    })


    res.send('Успешно');
}