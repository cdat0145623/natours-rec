const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../dev-data/utils/catchAsync');
// const AppError = require('../dev-data/utils/appError');

exports.setTourandId = (req, res, next) => {
  console.log('5 set tour and Id');
  if (!req.body.tour) {
    //confirm tour
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    //confirm user
    req.body.user = req.user.id;
  }
  console.log(req.body.tour);
  console.log(req.body.user);
  next();
};

exports.getAllReview = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

// If A User has taken a tour. Create a form allow user to review for this tour
// Thông qua booking in order to check that Does the user has taken tour?
// If Have: create new form allow them review tours
// If No: message, 400

// review.pug, create new form review, viewsController render
// API /reviews/${tour.name}/${user.name}/my-review
// createReview
// listen submit from review form
// save to database and (check) show review of user at API /tour/${tour.slug}
