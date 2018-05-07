'use strict';

const path = require('path');
const log = require('debug')('clicker:router-users');
const util = require('util');
const error = require('debug')('clicker:error');
const express = require('express');
const router = express.Router();
exports.router = router;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/users-database-model');
const gameEvents = require('../models/game-events');

exports.initPassport = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
};

exports.ensureAuthenticated = function(req, res, next) {
    if(req.user) next();
    else res.redirect('/users/login');
};

router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/',
    failuerFlash: true
}));

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/',
    failuerFlash: true
}));

router.post('/logout', function(req, res, next) {
    req.session.destroy();
    req.logout();
    gameEvents.userDisconnected();
    res.redirect('/');
});

router.get('/list', (req, res, next) => {
    userModel.allUsers()
    .then(list => {
        if(!list) list = [];
        res.send(list);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

router.get('/find/:pseudo', (req, res, next) => {
    userModel.find(req.params.pseudo)
    .then(user => {
        if(!user) {
            res.send("no find " + req.params.pseudo);
        }
        else {
            res.send(user);
        }
    })
});

router.get('/check/:pseudo/:password', (req, res, next) => {
    userModel.passwordCheck(req.params.pseudo, req.params.password)
    .then(check => { res.send(check); })
    .catch(err => { res.send(err); error(err.stack); next(false); });
});

passport.use('login', new LocalStrategy({usernameField: 'pseudo', passwordField: 'password'}, function(pseudo, password, done) {
    userModel.passwordCheck(pseudo, password)
    .then(response => {
        if(response.check) {
            gameEvents.userConnected(pseudo);
            return done(null, { pseudo: response.pseudo });
        }
        else {
            return done(null, false, { message: response.message });
        }
        return response;
    })
    .catch(err => done(err));
}));

passport.use('signup', new LocalStrategy({usernameField: 'pseudo', passwordField: 'password'}, function(pseudo, password, done) {
    userModel.register(pseudo, password)
    .then(result => {
        if(result) {
            gameEvents.userRegistered(pseudo);
            return done(null, { pseudo: result.pseudo })
        }
        else {
            return done(null, false, { message: 'This user alreay exist!' });
        }
        return result;
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user.pseudo);
});

passport.deserializeUser(function(pseudo, done) {
    userModel.find(pseudo)
    .then(user => done(null, user))
    .catch(err => done(err));
});