const express = require('express');
const router = express.Router();

router.post('/redirect/get-hash', async (req, res) => {
<<<<<<< HEAD
  await require('../controllers/connect/redirect/get-hash')(req, res);
});

router.post('/redirect/check-hash', async (req, res) => {
  await require('../controllers/connect/redirect/check-hash')(req, res);
});
=======
    await require('../controllers/connect/redirect/get-hash')(req,res);
})

router.post('/redirect/check-hash', async (req, res) => {
    await require('../controllers/connect/redirect/check-hash')(req,res);
})
>>>>>>> 62e31abc236f76d63cbfe1fbe849ada25c9d7725

module.exports = router;
