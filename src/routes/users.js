const router = require('express').Router();
const User = require('../models/User');
const passport = require('passport');
const Note = require('../models/Notes');
const { isAuthenticated } = require('../helpers/auth');
const moment = require('moment');

router.get('/users/signin', (req, res) => {
    if (req.user) {

        res.redirect('/');
    } else {
        res.render('users/signin');
    }
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/users/signup', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('users/signup');
    }
});

router.post('/users/signup', async (req, res) => {
    const { name, email, birthdate, password, confirm_password } = req.body;
    const errors = [];
    if (name.length <= 0) {
        errors.push({ text: 'Favor de ingresar un nombre' });
    }
    if (email.length <= 0) {
        errors.push({ text: 'Favor de ingresar un correo electrónico' });
    }
    if (password.length <= 0) {
        errors.push({ text: 'Favor de ingresar una contraseña' });
    } else if (password.length < 4) {
        errors.push({ text: 'Las contraseñas debe tener al menos 4 caracteres' });
    }
    const birthday = moment(birthdate, 'DD.MM.YYYY').format('MM.DD.YYYY');
    if (birthdate.length <= 0) {
        errors.push({ text: 'Favor de ingresar una fecha de nacimiento' });
    }
    if (password != confirm_password) {
        errors.push({ text: 'Las contraseñas no coinciden' });
    }
    const emailUser = await User.findOne({ email: email });
    if (emailUser) {
        errors.push({ text: 'El correo electrónico ya está en uso' });
    }
    if (errors.length > 0) {
        res.render('users/signup', { errors, name, email, birthdate, password, confirm_password });
    } else {
        const newUser = new User({ name, email, birthday, password });
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'Registro de usuario exitoso');
        res.redirect('/users/signin');
    }
});

router.get('/users/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/users/profile/:id', isAuthenticated, async (req, res) => {
    var contexto = "";
    await Note.find({ user: req.params.id }).sort({ date: 'desc' })
        .then(documentos => {
            contexto = {
                notes: documentos.map(documento => {
                    return {
                        _id: documento._id,
                        title: documento.title,
                        description: documento.description,
                        private: documento.private,
                        author: documento.author,
                        date: documento.date,
                        day: documento.date.getDate(),
                        month: documento.date.getMonth() + 1,
                        year: documento.date.getFullYear(),
                    }
                })
            }
        });
    var userinfo = "";
    await User.find({ _id: req.params.id })
        .then(documentos => {
            userinfo = {
                users: documentos.map(documento => {
                    return {
                        _id: documento._id,
                        name: documento.name,
                        email: documento.email,
                        birthday: documento.birthday,
                        description: documento.description,
                        tel: documento.tel,
                        facebook: documento.facebook,
                        twitter: documento.twitter,
                        instagram: documento.instagram,
                        day: documento.birthday.getDate(),
                        month: documento.birthday.getMonth() + 1,
                        year: documento.birthday.getFullYear()
                    }
                })
            }
        });
    if (req.user) {
        if (req.user._id == req.params.id) {
            console.log('Son iguales')
            res.render('users/profile', {
                notes: contexto.notes,
                users: userinfo.users,
                userid: req.user._id,
            });
        } else {
            res.render('users/profile-other', {
                notes: contexto.notes,
                users: userinfo.users,
                userid: req.user._id,
            });
            console.log('No son iguales')
        }
    }
});

router.get('/users/edit/:id', isAuthenticated, async (req, res, next) => {

    const user = await User.findById(req.params.id).lean();

    console.log("Este es el usuario ", user);
    res.render('users/edit-profile', {
        user,
        day: req.user.birthday.getDate(),
        month: req.user.birthday.getMonth() + 1,
        year: req.user.birthday.getFullYear(),
        userid: req.user._id
    });
});

router.put('/users/edit-profile/:id', isAuthenticated, async (req, res) => {
    const { name, description, birthdate, tel, facebook, twitter, instagram } = req.body;
    const { _id } = req.user;
    const user = { name, description, birthdate, tel, facebook, twitter, instagram };
    const errors = [];
    const birthday = moment(birthdate, 'DD.MM.YYYY').format('MM.DD.YYYY');
    if (name.length <= 0) {
        errors.push({ text: 'Favor de ingresar un nombre' });
    }
    if (birthdate.length <= 0) {
        errors.push({ text: 'Favor de ingresar una fecha de nacimiento' });
    }
    if (errors.length > 0) {
        req.flash('error_msg', "Favor de ingresar un nombre y fecha de nacimiento")
        res.redirect('/users/edit/' + _id);
    } else {
        await User.findByIdAndUpdate(req.params.id, { name, description, birthday, tel, facebook, twitter, instagram }).lean();
        req.flash('success_msg', "Perfil actualizado satisfactoriamente")
        res.redirect('/users/profile/' + _id);
    }
});

module.exports = router;