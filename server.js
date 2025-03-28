if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config()
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
//const passport = require('passport');
const passport = require('./passport-config');

const PORT = process.env?.PORT ?? 3000;

mongoose.connect(process.env.DATABASE_URL, {
})
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log("Server started on port", PORT));
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error.message);
  process.exit(1); // Detener la aplicación si la conexión falla
}); 

app.use(express.urlencoded({extended: true}))
app.set('view-engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET, // Cambia esto por una cadena secreta segura
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambia a true si estás usando HTTPS
}));

app.use(flash())

// Middleware para pasar mensajes flash a todas las vistas
app.use((req, res, next) => {
    res.locals.messages = {
        error: req.flash('error'),
        success: req.flash('success')
    };
    next();
});
app.use(passport.initialize())
app.use(passport.session())

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

//app.listen(PORT, () => console.log("Server started on port", PORT));