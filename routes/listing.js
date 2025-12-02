const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsnyc.js");
const { listingSchema } = require("../schema.js"); // Joi validation
const ExpressError = require("../utils/expressErrors.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js"); // Cloudinary config
const upload = multer({ storage });

// ⭐ Validate listing middleware
const validateListing = (req, res, next) => {
  // If multer uploaded files, attach them into listing.images
  if (req.files && req.files.length > 0) {
    req.body.listing.images = req.files.map(f => ({
      url: f.path,
      filename: f.filename
    }));
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errMsg));
  }
  next();
};

// ROUTES
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.array("images"), // <-- multiple files
    validateListing,
    wrapAsync(listingController.createListings)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    upload.array("images"),
    validateListing,
    wrapAsync(listingController.updateListings)
  )
  .delete(isLoggedIn, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEdit));

module.exports = router;
