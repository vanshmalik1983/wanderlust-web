const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsnyc.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/expressErrors.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
// const {cloudinary} = require("../cloudConfig.js");
const upload = multer({storage});

// Validate middleware
const validateListing = (req, res, next) => {
  if (req.body.listing && typeof req.body.listing.image === "string") {
    req.body.listing.image = { url: req.body.listing.image };
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListings)
  );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn,
    upload.single('listing[image]'),
    validateListing, wrapAsync(listingController.updateListings))
  .delete(isLoggedIn, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEdit));

module.exports = router;
