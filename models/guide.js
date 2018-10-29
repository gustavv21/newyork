var mongoose = require("mongoose");

var guideSchema = new mongoose.Schema({
    name: String,
    adress: String,
    image: String,
    price: String,
    dsc: String,
    created: {type: Date, default: Date.now},
    createdAt: { type: Date, default: Date.now },
    author: 
    {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Guide", guideSchema);