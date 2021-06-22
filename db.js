const { Client } = require("pg");

const client = new Client({
  user: "apps",
  host: "localhost",
  database: "apps",
  password: "DKJ&^%1231dsahldsaj(*&",
  port: 5432,
});

client.connect();

module.exports = client;
