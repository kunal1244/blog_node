const Article = require('../models').Article;
const Comment = require('../models').Comments;
module.exports = {
    createGet: (request, response) => {
        response.render('article/create', {user:request.user,error:''});
    },

    createPost: (request, response) => {
        let article_Body = request.body;
        let errorMsg = '';
        if (!request.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles!'
        } else if (!article_Body.title) {
            errorMsg = 'Invalid title!';
        } else if (!article_Body.content) {
            errorMsg = 'Invalid content!';
        }

        if (errorMsg) {
            response.render('article/create', {error: errorMsg, user:request.user});
            return;
        }
        Article.create({
            title:article_Body.title,
            content:article_Body.content,
            authorId:request.user.id,
            date:Date.now(),
            author:request.user.fullName,
            image_url:request.body.image_url
        }).then(article => {
            response.redirect('/');

        });
    },

    details:(request,response) => {
        let id = request.params.id;
        Article.findById(id).then(article => {
            Comment.findAll({ where: { postId: id } }).then(comments => {
                response.render('article/details',{id:article.id,image:article.image_url,title:article.title,content:article.content, date:article.date, author:article.author, authorId:article.authorId, user:request.user,comments:comments,error:''})
            })
        })
    },

    delete:(request, response) => {
        let req_id=request.params.id;
        Article.findById(req_id).then(article =>{
            if(request.user.dataValues.id==article.authorId){
                Article.destroy({
                    where:{
                        id:req_id,
                    }
                })
            }
        });
        response.redirect('/');
    },

    editGet: (request,response) => {
        let id = request.params.id;
        Article.findByPk(id).then(article => {
            response.render('article/update',{id:article.id,orig_title:article.title,orig_content:article.content, user:request.user,error:''})
        })
    },

    editPost: (request, response) => {
        let req_id=request.params.id;
        Article.findById(req_id).then(article =>{
            article.update({
                title:request.body.title,
                content:request.body.content,
                image_url:request.body.image_url
            })
        });
        response.redirect('/posts/'+req_id);

    }
};
