var express     = require("express");
var router      = express.Router();
var Guide       = require("../models/guide");
var Comment     = require("../models/comment");
var middleware  = require("../middleware/index.js");

router.get("/guide/:id/comment/new", middleware.isLoggedIn, function(req, res) {
    Guide.findById(req.params.id, function(err, guide) {
        if(err){
            console.log(err);
        } else {
            res.render("comment/new", {guide: guide});
        }
    });
});

router.post("/guide/:id/comment", middleware.isLoggedIn, function(req,res){
    Guide.findById(req.params.id, function(err, guide) {
        if(err){
            console.log(err)
            res.redirect("/guide/" + guide._id)
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    guide.comments.push(comment);
                    guide.save();
                    res.redirect("/guide/" + guide._id)
                }
            });
        }
    });
});

router.get("/guide/:id/comment/:comment_id/edit", middleware.checkOwnerComment, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("back")
        } else {
            res.render("comment/edit", {guide_id: req.params.id, comment: foundComment})
        }
    });
});

router.put("/guide/:id/comment/:comment_id", middleware.checkOwnerComment, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updateComment){
        if(err){
            res.redirect("back")
        } else {
            res.redirect("/guide/" + req.params.id)
        }
    });
});

router.delete("/guide/:id/comment/:comment_id", middleware.checkOwnerComment, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            res.redirect("back")
        } else {
            res.redirect("/guide/" + req.params.id)
        }
    });
});

module.exports = router;