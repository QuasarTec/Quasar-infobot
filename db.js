const { Client } = require('pg');

const client = new Client({
  user: 'apps',
  host: 'localhost',
  database: 'apps',
  password: 'UsdXRHQFU2LPu2KXnNjz',
  port: 5432,
});

client.connect();

module.exports = client;
