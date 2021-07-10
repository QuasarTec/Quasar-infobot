const express = require('express');
const router = express.Router();

router.get('/users/get_pay_date', async (req, res) => {
    await require('../../controllers/connect/pays/get_pay_date')(req, res)
})

router.get('/users/total_earnings', async (req, res) => {
    await require('../../controllers/connect/pays/total_earnings')(req, res)
})

router.get('/users/earnings_for_pay', async (req, res) => {
    await require('../../controllers/connect/pays/earnings_for_pay')(req, res)
})

router.post('/users/accruals/add', async (req, res) => {
    await require('../../controllers/connect/pays/accruals.js')(req, res)
})

module.exports = router;