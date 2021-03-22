const router = require('express').Router();
const Note = require('../models/Notes');

router.get('/notes/add', (req, res) =>{
    res.render('notes/new-notes');
});

router.post('/notes/new-notes', async (req, res) =>{
    console.log(req.body);
    const { title, description}= req.body;
    const errors= [];
    if (!title){
        errors.push({text: 'Por favor escriba un titulo'});
    }
    if (!description){
        errors.push({text: 'Por favor escriba una descripción'});
    }

    if(errors.length > 0){
        res.render('notes/new-notes', {
            errors,
            title,
            description
        });
    }else{
        const newNote = new Note({title,description});
        await newNote.save();
        console.log(newNote);
        res.redirect('/notes');
    }
});

router.get('/notes', async (req, res) => {
    await Note.find()
        .then(documentos => {
            const contexto = {
                notes: documentos.map(documento => {
                    return {
                        title: documento.title,
                        description: documento.description
                    }
                })
            }
            res.render('notes/all-notes', {
                notes: contexto.notes
            })
        })
})

module.exports = router;