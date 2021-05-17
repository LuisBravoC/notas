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
                        author: documento.author,
                        date: documento.date,
                        day: documento.date.getDate(),
                        month: documento.date.getMonth(),
                        year: documento.date.getFullYear(),
                    }
                })
            }
            if (req.user) {
                res.render('index', {
                    notes: contexto.notes,
                    name: req.user.id
                });
            } else {
                res.render('index', {
                    notes: contexto.notes,
                });
            }
        });
});

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/twitter', (req, res) => {
    res.render('twitter');
});

module.exports = router;