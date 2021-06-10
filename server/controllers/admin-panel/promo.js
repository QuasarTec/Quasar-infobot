const client = require('../../../commands/license/mysql');

module.exports = (req, res) => {
    let {
        usernames,
        type
    } = req.body;

    var licenses,
        limitDay;

    if (type === 'p1') {
        licenses = 500;
        limitDay = 17;
    } else if (type === 'p2') {
        licenses = 700;
        limitDay = 24;
    } else if (type === 'p3') {
        licenses = 1000;
        limitDay = 40;
    }

    usernames.forEach(el => {
        if (el[0] !== "@") {
            el = "@" + el;
        }

        const query = `INSERT INTO Licensi (\`Username\`, \`Timeset\`, \`Activate\`, \`ActivateLicens\`, \`LimitDay\`, \`Limit\`) VALUES ('${el}', '${new Date().toJSON().slice(0, 10)}', 1, true, ${limitDay}, ${licenses});`;

        client.query(query);
    })


    res.send('Успешно');
}