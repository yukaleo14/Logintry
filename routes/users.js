const express = require('express');
const router = express.Router();
const User = require('../model/user-model')
const passport = require('../passport-config');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

router.use(methodOverride('_method'))


router.get('/', checkNotAuthenticated, function (req, res) {
    res.render('index.ejs')
})

router.get('/user', async function (req, res) {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.get('/login', checkNotAuthenticated, function(req, res){
    res.render('login.ejs')
})

router.get('/register', checkNotAuthenticated, function(req, res){
    res.render('register.ejs')
})

router.get('/homePage', checkAuthenticated,  function(req, res){
    res.render('homePage.ejs', {name: req.user.username})
})

router.post('/register', checkNotAuthenticated, async function(req, res){
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        res.redirect('/users/register');
    }
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/users/homePage', // Redirige si la autenticación es exitosa
    failureRedirect: '/users/login',     // Redirige si la autenticación falla
    failureFlash: true            // Habilita mensajes flash para errores
}));


router.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/users/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
  
    res.redirect('/users/login')
  }
  
function checkNotAuthenticated(req, res, next) {
if (req.isAuthenticated()){
    return res.redirect('/users/homePage')
}

next()
}

module.exports = router;