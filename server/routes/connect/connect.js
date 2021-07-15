const express = require('express');
const router = express.Router();

router.get('/users/get_pay_date', async (req, res) => {
    await require('../../controllers/connect/pays/get_pay_date')(req, res);
});

router.get('/users/total_earnings', async (req, res) => {
    await require('../../controllers/connect/pays/total_earnings')(req, res);
});

router.get('/users/earnings_for_pay', async (req, res) => {
    await require('../../controllers/connect/pays/earnings_for_pay')(req, res);
});

router.get('/users/accruals/get-pay-link', async (req, res) => {
    await require('../../controllers/connect/pays/get-pay-link.js')(req, res);
});

router.get('/users/refs/refs-list', async (req, res) => {
    await require('../../controllers/connect/refs/refs_list')(req, res);
});

router.get('/users/refs/refs-link', async (req, res) => {
    await require('../../controllers/connect/refs/refs_link')(req, res);
});

router.get('/users/refs/refs-count', async (req, res) => {
    await require('../../controllers/connect/refs/refs_count')(req, res);
});

router.get('/users/refs/mentor', async (req, res) => {
    await require('../../controllers/connect/refs/mentor')(req, res);
});

router.get('/users/refs/viz-link', async (req, res) => {
    await require('../../controllers/connect/refs/refs_link')(req, res);
});

module.exports = router;
