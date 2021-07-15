const express = require('express');
const router = express.Router();

router.post('/redirect/get-hash', async (req, res) => {
    await require('../controllers/connect/redirect/get-hash')(req, res);
});

router.post('/redirect/check-hash', async (req, res) => {
    await require('../controllers/connect/redirect/check-hash')(req, res);
});

module.exports = router;
