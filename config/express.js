const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash= require('express-flash');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');

module.exports = (app, config) => {
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(config.rootFolder, '/public')));
    app.use((req, res, next) => {
        if (req.user) {
            res.locals.user = req.user;
            res.locals.error= '';
        }
        next();
    });
    app.set('views', (path.join(config.rootFolder, '/views')));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cookieParser('pesho'));

    app.use(session({secret: 'pesho', resave: false, saveUninitialized: false}));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    
    app.use(expressLayouts);
};
