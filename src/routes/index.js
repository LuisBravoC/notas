const router = require('express').Router();
const Note = require('../models/Notes');
const { isAuthenticated } = require('../helpers/auth');

router.get('/', async (req, res) => {
    await Note.find().sort({ date: 'desc' })
        .then(documentos => {
            const contexto = {
                notes: documentos.map(documento => {
                    return {
                        _id: documento._id,
                        title: documento.title,
                        description: documento.description,
                        private: documento.private,
                        author: documento.author,
                        user: documento.user,
                        date: documento.date,
                        day: documento.date.getDate(),
                        month: documento.date.getMonth() + 1,
                        year: documento.date.getFullYear(),
                    }
                })
            }
            if (req.user) {
                res.render('index', {
                    notes: contexto.notes,
                    userid: req.user._id
                });
            } else {
                res.render('index', {
                    notes: contexto.notes,
                });
            }
        });
});

router.get('/about', (req, res) => {
    if (req.user) {
        res.render('about', {
            userid: req.user._id
        });
    } else {
        res.render('about');
    }
});

router.get('/twitter', (req, res) => {
    res.render('twitter');
});

module.exports = router;