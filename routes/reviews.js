var express = require("express");
var router = express.Router({mergeParams: true});
var Guide = require("../models/guide");
var Review = require("../models/review");
var middleware = require("../middleware/index.js");

router.get("/", function (req, res) {
    Guide.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, guide) {
        if (err || !guide) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {guide: guide});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Guide.findById(req.params.id, function (err, guide) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {guide: guide});

    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    //lookup campground using ID
    Guide.findById(req.params.id).populate("reviews").exec(function (err, guide) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = guide;
            review.save();
            guide.reviews.push(review);
            guide.rating = calculateAverage(guide.reviews);
            guide.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/guide/' + guide._id);
        });
    });
});


router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {guide_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Guide.findById(req.params.id).populate("reviews").exec(function (err, guide) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            guide.rating = calculateAverage(guide.reviews);
            guide.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/guide/' + guide._id);
        });
    });
});

router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Guide.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, guide) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            guide.rating = calculateAverage(guide.reviews);
            guide.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/guide/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;