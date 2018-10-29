var express = require("express");
var router = express.Router();
var Guide   = require("../models/guide");
var Comment     = require("../models/comment");
var Review = require("../models/review");
var middleware  = require("../middleware/index.js");

router.get("/guide", function(req, res) {
   Guide.find({}, function(err, guides){
        if(err){
            console.log(err);
        } else {
            res.render("guide/index", {guides: guides, currentUser: req.user});
        }
    });
});

router.post("/guide", function(req, res){
    var name = req.body.name;
    var adress = req.body.adress;
    var image = req.body.image;
    var dsc = req.body.dsc;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newGuide = {name: name,adress: adress, image: image, dsc:dsc, price: price, author: author};
    // req.body.guide.body = req.sanitize(req.body.guide.body)
    Guide.create(newGuide, function(err, newGuide){
        if(err){
            res.render("guide/new");
        } else {
            res.redirect("/guide");
        }
    });
});

router.get("/guide/new", middleware.isLoggedIn, function(req, res) {
    res.render("guide/new");
});

router.get("/guide/:id", function(req, res) {
    Guide.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundGuide){
        if(err){
            console.log(err);
        } else {
            console.log(foundGuide);
            res.render("guide/show", {guide: foundGuide});
        }
    });
});

router.get("/guide/:id/edit", middleware.checkOwner, function(req, res) {
    Guide.findById(req.params.id, function(err,foundGuide){
        if(err){
            console.log(err);
        }
        res.render("guide/edit", {guide: foundGuide});
    });
});

router.put("/guide/:id", middleware.checkOwner, function(req, res) {
    req.body.guide.body = req.sanitize(req.body.guide.body);
    Guide.findByIdAndUpdate(req.params.id, req.body.guide, function(err, removeGuide){
        if(err){
            res.redirect("/guide");
        } else {
            res.redirect("/guide/" + req.params.id);
        }
    });
});

router.delete("/guide/:id", middleware.checkOwner, function(req,res){
    Guide.findById(req.params.id, function (err, guide) {
        if (err) {
            res.redirect("/guide");
        } else {
            Comment.remove({"_id": {$in: guide.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/guide");
                }
                Review.remove({"_id": {$in: guide.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/guide");
                    }
                    guide.remove();
                    req.flash("success", "Guide deleted successfully!");
                    res.redirect("/guide");
                });
            });
        }
    });
});

module.exports = router;