const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");

// INDEX - list all listings
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings }); // pass as allListings to match EJS
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// CREATE LISTING
module.exports.createListings = async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  // If multer uploaded a file
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect(`/listings/${listing._id}`);
};

// SHOW LISTING
module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" } // must match your review schema
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Cannot find that listing");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

// EDIT FORM
module.exports.renderEdit = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Cannot find that listing");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

// UPDATE LISTING
module.exports.updateListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // Update image if a new file is uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();
  req.flash("success", "Successfully updated listing!");
  res.redirect(`/listings/${listing._id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
