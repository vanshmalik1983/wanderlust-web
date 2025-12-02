const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");
const { isLoggedIn } = require("../middleware.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/expressErrors.js");

// Validate Listing
const validateListing = (req, res, next) => {
  if (req.files) {
    req.body.listing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  }
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(e => e.message).join(",");
    return next(new ExpressError(400, msg));
  }
  next();
};

// ROUTES
router.route("/")
  .get(listingController.index)
  .post(
    isLoggedIn,
    upload.array("listing[images]"),
    validateListing,
    listingController.createListings
  );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
  .get(listingController.showListing)
  .put(isLoggedIn, upload.array("listing[images]"), validateListing, listingController.updateListings)
  .delete(isLoggedIn, listingController.destroyListing);

router.get("/:id/edit", isLoggedIn, listingController.renderEdit);

module.exports = router;
