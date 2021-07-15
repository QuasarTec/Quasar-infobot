const { Client } = require('pg');

const client = new Client({
    user: 'apps',
    host: 'matrix-apps.c0w0nxnsuhxv.eu-north-1.rds.amazonaws.com',
    database: 'apps',
    password: '4Y5FvarAv3hT69B',
    port: 5432,
});

client.connect();

module.exports = client;
