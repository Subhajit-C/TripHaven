//to run in an environment and not locally
require("dotenv").config({ quiet: true });

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")


const PORT = process.env.PORT || 8080;

const MONGO_URL = process.env.MONGO_URL;

//connecting to db
main().then(() => {
    console.log("MongoDB connected successfully");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}





app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title : "My New Villa",
        description : "By the beach",
        price : 1200,
        location : "Marin drive, Mumbai",
        country : "India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
});






app.get("/", (req, res) => {
    res.send("working");
})







app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
})