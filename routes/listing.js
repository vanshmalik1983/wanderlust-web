const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsnyc.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/expressErrors.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ⭐ FIXED validateListing ⭐
const validateListing = (req, res, next) => {
  // If multer uploaded a file, attach it into the listing object
  if (req.file) {
    req.body.listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(400, errMsg)); // ⭐ Important!
  }

  next();
};

// ROUTES
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListings)
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListings)
  )
  .delete(isLoggedIn, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEdit));

module.exports = router;
