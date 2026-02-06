//to run in an environment and not locally
require("dotenv").config({ quiet: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")

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





//INDEX ROUTE: Home route where the content is shown. 
app.get("/listings",  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , { allListings });
}));






//NEW ROUTE: will redirect to a new page to write details for a new listings
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


//note: the route order matters in express. always put /new before /:id. in this case, if the new route in written after the show route it would have given an error because the it would have treaded the /new as an :id and would search the db


//SHOW ROUTE: where the details of the content will be show individually
app.get("/listings/:id",  wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });

}));


//CREATE ROUTE: sends post request and update the db
app.post("/listings", wrapAsync(async(req, res, next) => {
    // wrapAsync is a helper function used in Express apps to handle errors from async/await routes cleanly.
    // It saves you from writing try–catch blocks again and again.

    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }


    // let { title, description, image, price, location, country } = req.body;
    //made some changes in new.ejs so that it returns an object "listing" containing all the things and we can access it with req.body
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));




//EDIT ROUTE
app.get("/listings/:id/edit",  wrapAsync(async(req, res) => { 
    let { id } = req.params;
    const listing = await Listing.findById(id); 
    res.render("listings/edit.ejs", { listing });
}));



//UPDATE ROUTE
app.put("/listings/:id",  wrapAsync(async(req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));



//DELETE ROUTE
app.delete("/listings/:id",  wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(`Deleted this listing: ${deletedListing}`);
    res.redirect("/listings");
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






app.get("/", (req, res) => {
    res.send("working");
})







app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
})