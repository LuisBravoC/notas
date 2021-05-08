const router = require('express').Router();

const User = require('../models/User');

const passport = require('passport');

router.get('/users/signin', (req, res) =>{
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
    
}));

router.get('/users/signup', (req, res) =>{
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) =>{
    const { name, email, password, confirm_password } = req.body;
    const errors = [];
    if(name.length <= 0){
        errors.push({text: 'Favor de ingresar un nombre'});
    }
    if(email.length <= 0){
        errors.push({text: 'Favor de ingresar un correo electrónico'});
    }
    if(password.length <= 0){
        errors.push({text: 'Favor de ingresar una contraseña'});
    } else if (password.length < 4){
            errors.push({text: 'Las contraseñas debe tener al menos 4 caracteres'});
    }
    if(password != confirm_password){
        errors.push({text: 'Las contraseñas no coinciden'});
    }
    const emailUser = await User.findOne({email: email});
    if(emailUser){
        errors.push({text: 'El correo electrónico ya está en uso'});
        }
    if(errors.length > 0){
        res.render('users/signup', { errors, name, email, password, confirm_password });
    } else {
        const newUser = new User({name, email, password});
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

module.exports = router;