//to run in an environment and not locally
require("dotenv").config({ quiet: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

//method override for put(update) and delete request 
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//setting up ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))


//to use content from the url
app.use(express.urlencoded({ extended:true }));

//to use static files in public folder
app.use(express.static(path.join(__dirname, "public")));


const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);


//for errors using wrapAsync
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


//for validation of the data
const {listingSchema, reviewSchema} = require("./schema.js");

const listings = require("./routes/listings.js");


const PORT = process.env.PORT || 8080;

const MONGO_URL = process.env.MONGO_URI;

//connecting to db
main().then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}





app.get("/", (req, res) => {
    res.send("working");
})




const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
}
 



app.use("/listings", listings);




//REVIEWS

//Post Reviews Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
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
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
 
    res.redirect(`/listings/${id}`);
}));





// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Marin drive, Mumbai",
//         country : "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });



// Catch-all middleware: runs when no route matches and forwards a 404 error
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});




// Global error-handling middleware: catches all errors (sync + async) and sends a response
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went worng!" } = err;
    res.status(statusCode).render("error.ejs", { err });
})








app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
})