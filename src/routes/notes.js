const router = require('express').Router();
const Note = require('../models/Notes');

const { isAuthenticated } = require('../helpers/auth');

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-notes', {
        userid: req.user._id
    });
});

router.post('/notes/new-notes', isAuthenticated, async (req, res) => {
    const { title, description, private } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Por favor escriba un titulo' });
    }
    if (!description) {
        errors.push({ text: 'Por favor escriba una descripción' });
    }

    if (errors.length > 0) {
        res.render('notes/new-notes', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({ title, description, private });
        newNote.user = req.user.id;
        newNote.author = req.user.name;
        await newNote.save();
        req.flash('success_msg', "Nota agregada satisfactoriamente")
        console.log(newNote);
        res.redirect('/notes');
    }
});

router.get('/notes', isAuthenticated, async (req, res) => {
    console.log("Body ", req.user);
    await Note.find({user: req.user.id}).sort({ date: 'desc' })
        .then(documentos => {
            const contexto = {
                notes: documentos.map(documento => {
                    return {
                        _id: documento._id,
                        title: documento.title,
                        description: documento.description,
                        date: documento.date,
                        day: documento.date.getDate(),
                        month: documento.date.getMonth() + 1,
                        year: documento.date.getFullYear(),
                    }
                })
            }
            res.render('notes/all-notes', {
                notes: contexto.notes,
                username: req.user.name,
                userid: req.user._id
            })
        });
});

router.get('/notes/edit/:id', isAuthenticated, async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    console.log(note);
    res.render('notes/edit-note', { 
        note,
        userid: req.user._id 
    });
});

router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const { title, description, private } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description, private }).lean();
    req.flash('success_msg', "Nota actualizada satisfactoriamente")
    res.redirect('/notes');
});

router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', "Nota eliminada satisfactoriamente")
    res.redirect('/notes');
});

module.exports = router;