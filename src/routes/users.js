const router = require('express').Router();
const User = require('../models/User');
const passport = require('passport');
const Note = require('../models/Notes');
const { isAuthenticated } = require('../helpers/auth');

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
    const { name, email, birthday, password, confirm_password } = req.body;
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
    if (birthday.length <= 0) {
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
        res.render('users/signup', { errors, name, email, birthday, password, confirm_password });
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
    var userinfo = "";
    await User.find({ _id: req.params.id })
        .then(documentos => {
            userinfo = {
                users: documentos.map(documento => {
                    return {
                        birthday: documento.birthday,
                        description: documento.description,
                        day: documento.birthday.getDate(),
                        month: documento.birthday.getMonth() + 1,
                        year: documento.birthday.getFullYear()
                    }
                })
            }
        });

    const user = await User.findById(req.params.id).lean();

    console.log("Este es el usuario ", user);
    console.log("Este es el userinfo ", userinfo);
    res.render('users/edit-profile', {
        user,
        users: userinfo.users,
        userid: req.user._id
    });
});

router.put('/users/edit-profile/:id', isAuthenticated, async (req, res) => {
    const { name, birthday, description, tel, facebook, twitter, instagram } = req.body;
    const { _id } = req.user;
    const user = { name, birthday, description, tel, facebook, twitter, instagram };
    const errors = [];
    if (name.length <= 0) {
        errors.push({ text: 'Favor de ingresar un nombre' });
    }
    if (birthday.length <= 0) {
        errors.push({ text: 'Favor de ingresar una fecha de nacimiento' });
    }
    if (errors.length > 0) {
        res.render('users/edit-profile', { user });
    } else {
        await User.findByIdAndUpdate(req.params.id, { name, birthday, description, tel, facebook, twitter, instagram }).lean();
        req.flash('success_msg', "Perfil actualizada satisfactoriamente")
        res.redirect('/users/profile/'+_id);
    }
});

module.exports = router;