const User = require('../routes/user');
const Home = require('../routes/home');
const Posts = require('../routes/posts');
const Comments=require('../routes/comments')

module.exports = (app) => {
    app.get('/', Home.index);

    app.get('/user/register', User.registerGet);
    app.post('/user/register', User.registerPost);

    app.get('/user/login', User.loginGet);
    app.post('/user/login', User.loginPost);

    app.get('/user/logout', User.logout);

    app.get('/posts/create', Posts.createGet);
    app.post('/posts/create', Posts.createPost);
    app.get('/posts/:id',Posts.details);
    app.get('/posts/:id/delete',Posts.delete);
    app.get('/posts/:id/edit',Posts.editGet);
    app.post('/posts/:id/edit',Posts.editPost);
    
    app.post('/posts/:id/create',Comments.create);
    app.get('/comments/:id',Comments.delete);


};
