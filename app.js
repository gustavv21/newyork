var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    sanitizer       = require("express-sanitizer"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    Guide           = require("./models/guide"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seed");

var guideRoutes   = require("./routes/guide"),
    commentRoutes = require("./routes/comment"),
    reviewRoutes  = require("./routes/reviews"),
    authRoutes    = require("./routes/auth");


mongoose.connect("mongodb://localhost/guide_list");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(sanitizer());
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.use(require("express-session")({
    secret: "fifa",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(authRoutes);
app.use(guideRoutes);
app.use(commentRoutes);
app.use("/guide/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(req,res){
    console.log("serwer is on");
});