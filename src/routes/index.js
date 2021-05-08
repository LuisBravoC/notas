const router = require('express').Router();

router.get('/', (req, res) =>{
    res.render('index');
});

router.get('/about', (req, res) =>{
    res.render('about');
});

router.get('/twitter', (req, res) =>{
    res.render('twitter');
});

module.exports = router;