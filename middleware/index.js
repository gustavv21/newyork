var Comment = require("../models/comment");
var Guide   = require("../models/guide");
var Review = require("../models/review");

var middlewareObj = {};

middlewareObj.checkOwnerComment = function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

middlewareObj.checkOwner = function(req,res,next){
    if(req.isAuthenticated()){
            Guide.findById(req.params.id, function(err, foundGuide){
                if(err){
                    res.redirect("back");
                } else {
                    if(foundGuide.author.id.equals(req.user._id) || req.user.isAdmin) {
                        next();
                    } else {
                        res.redirect("back");
                    }
                }
            });
    } else {
        res.redirect("back");
    }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Guide.findById(req.params.id).populate("reviews").exec(function (err, foundGuide) {
            if (err || !foundGuide) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                var foundUserReview = foundGuide.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

module.exports = middlewareObj;