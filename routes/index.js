'use strict';
require('babel-register')({
    presets: ['react', 'es2015']
});

// var express = require('express');
// var router = express.Router();
// var mongoose = require('mongoose');
// var User = require('../models/Users');
// var Citation = require('../models/Citations');
// var React = require("react");
// var ReactDOMServer = require("react-dom/server");
// var passport = require("passport");
// var crypto = require("crypto");
// var nodemailer = require('nodemailer');
// var cors = require("cors");

import express from 'express';
var router = express.Router();
import mongoose from 'mongoose';
import User from '../models/Users';
import Exam from '../models/Exams';
import React from 'react';
import passport from 'passport';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

require("../config/passport");

/******************************************************************************
******************________AUTHENTICATION ROUTES_________***********************
******************************************************************************/

//Authentication middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("You are logged in!");
        return next(); 
    }
    req.flash('err', "You must first log in or register first!");
    res.redirect('/login');
}

/*****************
*******LOCAL******
*****************/

router.post('/signup', (req, res) => {
    User.findOne({"local.email" : req.body.email}, (err, user) => {
        if(err) {console.log(err);}
        
        if(!user) {
            var newUser = new User();
            
            User.find({}, (err, users) => {
                if(err) {console.log(err);}
                newUser.local.email = req.body.email;
                newUser.local.password = newUser.generateHash(req.body.password);
                newUser.local.username= req.body.username;
                newUser.local.created = Date.now();
                newUser.local.id = +(users.length) + 1;
                newUser.firstName = req.body.firstName;
                newUser.lastName = req.body.lastName;
                newUser.exams = [];
                newUser.local.resetPasswordToken = null;
                newUser.local.resetExpires = null;
                
                newUser.save((err) => {
                    if(err) {console.log(err);}
                });
                
                req.json({message:'New user created'});
                req.login(newUser, (err) => {
                    if(err) {console.log(err);}
                    return res.redirect('/');
                });
            });
            
        }else{
            req.flash('err', 'Sorry, that user already exists.');
            res.redirect('/login');
        }
    });
});
    
router.post('/signon', passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    }));
    
router.post('/forgot', (req, res) => {
   User.findOne({'local.email' : req.body.email}, (err, user) => {
        if(err){res.json(err);}
        if(!user) {
            req.flash('err', 'User does not exist')
            return res.redirect('/login');
            
        }
       
        crypto.randomBytes(20, (err, buf) => {
            if (err) {throw err;}
            var token =  buf.toString('hex');
            console.log(token);
            user.local.resetPasswordToken = token;
            user.local.resetExpires = Date.now() + 1200000;
            var link = `https://${req.hostName}/reset/${token}`;
            console.log(link);
            var text = `You (or someone else) requested a password reset. If you did not request this, ignore this email. The reset link will expire in 20 minutes. Otherwise, click the link or copy and paste link into your browser.`;
            var transport = nodemailer.createTransport("SMTP", {
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_ADDRESS, // Your email id
                    pass: process.env.EMAIL_PASSWORD // Your password
                }
            });
            var date = new Date(Date.now());
            var dateString = `${date.toLocaleDateString('en-us')} ${date.toLocaleTimeString()}`;
            var mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: user.local.email,
                subject: `Password reset requested at ${dateString}`,
                text: `${text}  ${link}`,
                html: `<p>${text}</p><br><a href="${link}">${link}</a>`
            };
            transport.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log(JSON.stringify(info, null, 2));
                }
            });
            
            user.save((err) => {
                if(err){console.log(err);}
            });
            console.log('Password token set.');
            req.flash('done', `Your reset link has been sent to ${req.body.email}.`);
            res.redirect('/login');
       });
   }); 
});

router.get('/reset/:token', (req, res) => {
  User.findOne({ 'local.resetPasswordToken': req.params.token}, function(err, user) {
    if(err) {return res.json(err);}
    if (!user || user.local.resetExpires < Date.now()) {
      req.flash('err', 'Password reset token is invalid or has expired.');
      return res.redirect('/login');
    }
    req.flash('done', `Enter your new password and click submit, ${user.local.username}`);
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', (req, res) => {
    User.findOne({'local.resetPasswordToken' : req.params.token}, (err, user) => {
        if(err) {return res.json(err);}
        console.log(req.body.password);
        user.local.password = user.generateHash(req.body.password);
        user.local.resetPasswordToken = undefined;
        user.local.resetExpires = undefined;
        
        user.save((err) => {
            if(err) {console.log(err);}
        });
        
        req.flash('done', 'New Password Saved!');
        req.login(user, (err) => {
            if(err) {console.log(err);}
            return res.redirect('/');
        });
    });
});


/******************************************************************************
*****************____________Page Routing____________**************************
******************************************************************************/


router.get('/', isLoggedIn, (req, res) => {
    res.render('index.ejs');
});

router.get('/login', (req, res) => {
    res.render('login.ejs');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('done', 'You have successfully logged out!');
    res.redirect('/login');
});

/******************************************************************************
****************______________API Routing______________************************
******************************************************************************/

router.get('/api/me', isLoggedIn, (req, res) => {
    if(req.user === undefined) {
        res.json({message: "You must log in first!"});
    }else{
        var user = {
            local: {}
        };
        user.local.username = req.user.local.username;
        user.local.email = req.user.local.email;
        user.local.created = req.user.local.created;
        user.local.id = req.user.local.id;
        user.message = "Who's awesome you're awesome. Thanks for signing in!";
        res.json(user);
    }
});


router.get('*', (req, res) => {
    res.render('index.ejs');
});

module.exports = router;