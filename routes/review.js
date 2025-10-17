const express = require("express");
const router = express.Router({mergeParams:true});
const ExpressError = require("../utils/expressErrors.js");
const wrapAsync = require("../utils/wrapAsnyc.js");
const { reviewSchema} = require("../schema.js");
const reviews = require("../routes/review.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");



const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");

//review post
router.post("/",isLoggedIn ,validateReview, wrapAsync(reviewController.createReview));

//delete review
router.delete("/:reviewId",isLoggedIn ,wrapAsync(reviewController.destroyReview));
module.exports = router;