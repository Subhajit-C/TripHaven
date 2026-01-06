//to run in an environment and not locally
require("dotenv").config({ quiet: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")

//method override for update and put request 
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//setting up ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))


//to use content from the url
app.use(express.urlencoded({ extended:true }));




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
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , { allListings });
})






//NEW ROUTE: will redirect to a new page to write details for a new listings
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


//note: the route order matters in express. always put /new before /:id. in this case, if the new route in written after the show route it would have given an error because the it would have treaded the /new as an :id and would search the db


//SHOW ROUTE: where the details of the content will be show individually
app.get("/listings/:id", async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });

});


//CREATE ROUTE: sends post request and update the db
app.post("/listings", async(req, res) => {
    // let { title, description, image, price, location, country } = req.body;
    //made some changes in new.ejs so that it returns an object "listing" containing all the things and we can access it with req.body
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});




//EDIT ROUTE
app.get("/listings/:id/edit", async(req, res) => { 
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});



//UPDATE ROUTE
app.put("/listings/:id", async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});





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






app.get("/", (req, res) => {
    res.send("working");
})







app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
})