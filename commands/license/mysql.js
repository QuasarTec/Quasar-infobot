const mysql = require('mysql2/promise');

const query = async (query) => {
    // create the connection
    const connection = await mysql.createConnection({
        host: 'udanisqn.beget.tech',
        user: 'udanisqn_11111',
        password: 'Vedaza73',
        database: 'udanisqn_11111',
    });

    // query database
    const [rows] = await connection.execute(query);

    return rows;
};

module.exports = {
    query,
};
