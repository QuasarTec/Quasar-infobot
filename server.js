const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
const _ = require('./bot');
const routes = require('./server/routes/routes');

app.use(cors());

app.use(express.json());

app.use(express.static('static/refs'));
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`The server is listening on port ${PORT}`);
});
