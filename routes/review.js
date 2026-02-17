const express = require("express");

//Copies params from parent route into the child router
//mergeParams: true enables a child router to access URL parameters defined in its parent route.
const router = express.Router({ mergeParams : true });

//model
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//for errors using wrapAsync
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const {reviewSchema} = require("../schema.js");





const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};






//REVIEWS

//Post Reviews Route
router.post("/", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    //add the new review id to the "reviews" array in the listing document
    listing.reviews.push(newReview);

    //then saving both newReview and the listing in the database respectively in their own collections
    await newReview.save();
    await listing.save();     

    res.redirect(`/listings/${listing._id}`);
}));




//Delete Review Route
router.delete("/:reviewId", wrapAsync(async(req,res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
 
    res.redirect(`/listings/${id}`);
}));



module.exports = router;