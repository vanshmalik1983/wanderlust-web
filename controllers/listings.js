const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate("owner") // <-- Important!
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

module.exports.createListings = async (req, res) => {
  let url= req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url , filename};

  await newListing.save();
  req.flash("success", "New listing created");
  res.redirect(`/listings/${newListing._id}`); // Redirect to show page
};

module.exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Optional: Ensure only owner can edit
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing.");
    return res.redirect(`/listings/${id}`);
  }
  let originalImage = listing.image.url;
  originalImageUrl = originalImage.replace("/upload" , "/upload/w_250");
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListings = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to update this listing.");
    return res.redirect(`/listings/${id}`);
  }

  // Normalize image
  if (req.body.listing.image && typeof req.body.listing.image === "string") {
    req.body.listing.image = { url: req.body.listing.image };
  }

  let listing1 = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !== "undefined"){
  let url= req.file.path;
  let filename = req.file.filename;
  listing1.image =  {url , filename};
  await listing1.save();
  }
  req.flash("success", "Listing updated successfully.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this listing.");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/listings");
};