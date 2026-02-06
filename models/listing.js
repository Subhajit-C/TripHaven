const mongoose = require("mongoose");
const Schema = mongoose.Schema;



//schema
const listingSchema = new Schema({
    title : {
        type : String,
        required : true,
    },

    description : String,

    image : {
        type : String,
        //this is the default value of the image if its value is undefined
        default : "https://thumbs.dreamstime.com/z/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available-236105299.jpg?ct=jpeg",

        //this is the condition set for image to set the value automatically if the user does not give the image link and submits and empty string
        set : (v) => v === "" ? "https://thumbs.dreamstime.com/z/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available-236105299.jpg?ct=jpeg":v,
    },

    price : {
        type : Number,
        required : true,
        min : 0
    },

    location : {
        type : String,
        required : true,
    },

    country : {
        type : String,
        required : true,
    },
});


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;