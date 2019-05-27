const User = require('../models').User;
const encryption=require('./encryption');
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
        response.render('user/login', {user:request.user,error:''});
    },

    loginPost: (request, response) => {
        let log_body = request.body;
        User.findOne({where:{email: log_body.email}}).then(user => {
            if (!user ||!user.authenticate(log_body.password)) {
                response.render('user/login', {user:request.user,error:'username or password is invalid!'});
                return;
            }

            request.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    response.redirect('/user/login');
                    return;
                }

                response.redirect('/');
            })
        })
    },

    logout: (request, response) => {
        request.logOut();
        response.redirect('/');
    }
};