//to run in an environment and not locally
require("dotenv").config({ quiet: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");

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


const ExpressError = require("./utils/ExpressError.js");


//for routers
const listings = require("./routes/listings.js");
const reviews = require("./routes/review.js");


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

 


//for listing routes
app.use("/listings", listings);


//for review routes
app.use("/listings/:id/reviews", reviews)





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