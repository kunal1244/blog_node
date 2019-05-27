const Comment = require('../models').Comments;
module.exports = {
    create: (request, response) => {
        let comment_Body = request.body;
        let errorMsg = '';
        if (!request.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles!'
        }
        else if (!comment_Body.content) {
            errorMsg = 'Invalid content!';
        }

        if (errorMsg) {
            console.log(errorMsg);
            response.render('article/create', {error: errorMsg, user:request.user});
            return;
        }
        Comment.create({
            content:comment_Body.content,
            authorId:request.user.id,
            date:Date.now(),
            authorName:request.user.fullName,
            postId:parseInt(request.url.charAt(7)),
        }).then(article => {
            response.redirect('/posts/'+request.url.charAt(7));

        });
    },

    delete:(request, response) => {
        let req_id=request.params.id;
        Comment.findById(req_id).then(comment =>{
            if(request.user.dataValues.id==comment.authorId){
                Comment.destroy({
                    where:{
                        id:req_id,
                    }
                })
            }
        });
        response.redirect('/');
    },
};
