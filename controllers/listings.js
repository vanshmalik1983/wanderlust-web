const Listing = require("../models/listing");

// 🟢 Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// 🟢 Render NEW form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// 🟢 Show ONE listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing) {
    req.flash("error", "No listing found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing, currUser: req.user });
};

// 🟢 Create Listing
module.exports.createListings = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  // Add owner
  newListing.owner = req.user._id;

  // Add image (Cloudinary)
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

// 🟢 Render EDIT form
module.exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing.");
    return res.redirect(`/listings/${id}`);
  }

  // Thumbnail for preview
  let original = listing.image.url;
  listing.thumbnail = original.replace("/upload", "/upload/w_300");

  res.render("listings/edit.ejs", { listing });
};

// 🟢 Update Listing
module.exports.updateListings = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to update this listing.");
    return res.redirect(`/listings/${id}`);
  }

  // Update text fields
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // If new image uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// 🟢 Delete Listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this listing.");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};
