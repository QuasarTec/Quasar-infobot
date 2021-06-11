const express = require('express');
const router = express.Router();
const SECRET_TOKEN = "92807f35d855546c12b93145446f9950624adcef7a91c551149bd56daf35c463f952861ae23ec99b28ee28243ea89e5ec4c1f6bcb4a8ddb233a5a926b524f9b7"

router.use(async (req, res, next) => {
    if (SECRET_TOKEN !== req.body.token && req.method === "POST" && req.url.includes('admin-panel')) {
        return res.send('Token invalid')
    }
    next();
})

router.get('/admin-panel/', async (req, res) => {
    res.sendFile(__dirname + "/static/index.html")
})

router.get('/admin-panel/users/all', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/all.html")
})

router.get('/admin-panel/users/multi', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/multi.html")
})

router.get('/admin-panel/users/single', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/single.html")
})

router.get('/admin-panel/users/main-js', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/js/main.js")
})

router.get('/admin-panel/users/accrual', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/accrual.html")
})

router.get('/admin-panel/users/promo', async (req, res) => {
    res.sendFile(__dirname + "/static/assets/promo.html");
})

router.post('/admin-panel/users/activate', (req, res) => {
    require('../../controllers/admin-panel/activete_and_deactivete')(req,res,'Now()')
})

router.post('/admin-panel/users/deactivate', (req, res) => {
    require('../../controllers/admin-panel/activete_and_deactivete')(req,res,'Null')
})

router.post('/admin-panel/users/accrual', (req,res) => {
    require('../../controllers/admin-panel/accrual')(req,res)
})

router.post('/admin-panel/users/promo', (req,res) => {
    require('../../controllers/admin-panel/promo')(req,res)
})


module.exports = router;