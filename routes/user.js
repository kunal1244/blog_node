const User = require('../models').User;
const encryption=require('./encryption');
const nodemailer=require('nodemailer');
const async=require('async');
const crypto=require('crypto');
let token;
module.exports = {
    registerGet: (request, response) => {
        response.render('user/register',{user:request.user,error:''});
    },

    registerPost:(request, response) => {
        const req_body=request.body;
        User.findOne({ where: {email: req_body.email}}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'Username exists!';
            }
            else if (req_body.password !== req_body.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }
            if (errorMsg) {
                response.render('user/register', {user:request.user,error:errorMsg})
            }
            else {
                let salt = encryption.generateSalt();

                User.create({
                    email: req_body.email,
                    passwordHash: encryption.hashPassword(req_body.password, salt),
                    fullName: req_body.fullName,
                    salt: salt
                }).then(user => {
                    request.logIn(user, (err) => {
                        if (err) {
                            response.render('user/register', {error:err.message});
                            return;
                        }
                        response.redirect('/')
                    })
                })
            }
        })
    },

    loginGet: (request, response) => {
        response.render('user/login', {user:request.user,error:'',token:token});
    },

    loginPost: (request, response) => {
        
        let log_body = request.body;
        User.findOne({where:{email: log_body.email}}).then(user => {
            if (!user ||!user.authenticate(log_body.password)) {
                response.render('user/login', {user:request.user,error:'username or password is invalid!'});
                return;
            }
            if(log_body.otp==token){
            
                request.logIn(user, (err) => {
                    if (err) {
                        console.log(err);
                        response.redirect('/user/login');
                        return;
                    }
                    response.redirect('/');
                })
            }
            else{
                response.render('user/login',{user:request.user,error:'Please enter OTP'})
            }
        })
    },

    getOTP: (request,response) => {
        
        async.waterfall([
            function(done) {
                User.findOne({where:{ email: request.body.email }}).then(user => {
                    if (!user) {
                        request.flash('error', 'No account with that email address exists.');
                        return response.redirect('/user/login');
                    }
                    else{
                        token=encryption.hashPassword('abcd', user.salt);
                        done(null,token, user);
                    }
                });
            },
            function(temp_token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        type:'OAuth2',
                        user: 'kunal.das@flexiele.com',
                        clientId:'523983442904-dev4oj5eetn8rfbqg97dkmfka1egiarb.apps.googleusercontent.com',
                        clientSecret: 'SfvVtZ6N6494Dy5a6whtIMNS',
                        refreshToken:'1/dbBJYYoro9UA0aOaLODT2DB4GOeouhdNoeBWYkoel2xCEltbucGdUv_CzIT5fjWa',
                        accessToken:'ya29.GlsXB-gAV0CoN34fejQi3YGf484EL0szSa_DD_iJax0XRjOOGJMWqnxnswzvbQPGzaImZ5BVyM8DE6m1yyCHh7DMR0g8iRgjHMxxmKsm3a9yoWAPybT23-xL9J4J'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@demo.com',
                    subject: 'Node.js OTP',
                    text: 'OTP for your login is '+temp_token
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    request.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            response.redirect('/user/login');
        });
    },

    logout: (request, response) => {
        request.logOut();
        response.redirect('/');
    },

    forgotGet: (request,response) => {
        response.render('user/forgot', {user:request.user,error:''});
    },

    forgotPost: (request, response,next) => {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({where:{ email: request.body.email }}).then(user => {
                    if (!user) {
                        request.flash('error', 'No account with that email address exists.');
                        return response.redirect('/forgot');
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000;
                    user.save().then((err) => {
                        done(null,token, user);
                    });
                });
            },
            function(token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        type:'OAuth2',
                        user: 'kunal.das@flexiele.com',
                        clientId:'523983442904-dev4oj5eetn8rfbqg97dkmfka1egiarb.apps.googleusercontent.com',
                        clientSecret: 'SfvVtZ6N6494Dy5a6whtIMNS',
                        refreshToken:'1/dbBJYYoro9UA0aOaLODT2DB4GOeouhdNoeBWYkoel2xCEltbucGdUv_CzIT5fjWa',
                        accessToken:'ya29.GlsXB-gAV0CoN34fejQi3YGf484EL0szSa_DD_iJax0XRjOOGJMWqnxnswzvbQPGzaImZ5BVyM8DE6m1yyCHh7DMR0g8iRgjHMxxmKsm3a9yoWAPybT23-xL9J4J'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@demo.com',
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + request.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    request.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            response.redirect('/forgot');
        });
    },

    resetGet:(req,res)=>{
        User.findOne({where:{ resetPasswordToken: req.params.token}}).then(user => {
            if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
            }
            res.render('user/reset', {user: req.user, error:'', token:req.params.token});
        })
    },

    resetPost:(req,res)=>{
        async.waterfall([
            function(done) {
              User.findOne({where:{ resetPasswordToken: req.params.token }}).then(user=> {
                if (!user) {
                  req.flash('error', 'Password reset token is invalid or has expired.');
                  return res.redirect('back');
                }
        
                user.passwordHash = encryption.hashPassword(req.body.password, user.salt);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
        
                user.save().then(()=> {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            },
            function(user, done) {
              var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    type:'OAuth2',
                    user: 'kunal.das@flexiele.com',
                    clientId:'523983442904-dev4oj5eetn8rfbqg97dkmfka1egiarb.apps.googleusercontent.com',
                    clientSecret: 'SfvVtZ6N6494Dy5a6whtIMNS',
                    refreshToken:'1/dbBJYYoro9UA0aOaLODT2DB4GOeouhdNoeBWYkoel2xCEltbucGdUv_CzIT5fjWa',
                    accessToken:'ya29.GlsXB-gAV0CoN34fejQi3YGf484EL0szSa_DD_iJax0XRjOOGJMWqnxnswzvbQPGzaImZ5BVyM8DE6m1yyCHh7DMR0g8iRgjHMxxmKsm3a9yoWAPybT23-xL9J4J'
                }
              });
              var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
              });
            }
          ], function(err) {
            res.redirect('/');
          });
    }
    
};