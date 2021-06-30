const { Client } = require('pg');

const client = new Client({
  user: 'apps',
<<<<<<< HEAD
  host: 'apps-database.cluster-c0w0nxnsuhxv.eu-north-1.rds.amazonaws.com',
  database: 'apps',
  password: '4Y5FvarAv3hT69B',
=======
  host: 'localhost',
  database: 'apps',
  password: 'UsdXRHQFU2LPu2KXnNjz',
>>>>>>> 62e31abc236f76d63cbfe1fbe849ada25c9d7725
  port: 5432,
});

client.connect();

module.exports = client;
