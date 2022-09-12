const Tour = require("../models/tourModels");
const User = require("../models/userModels");
const catchAsync = require("../dev-data/utils/catchAsync");
const AppError = require("../dev-data/utils/appError");
const Booking = require("../models/bookingModel");

exports.getOverView = catchAsync(async (req, res, next) => {
  //1) Get Tour data from collection
  const tours = await Tour.find();

  //2) Build template
  //3) Render that template from tour data 1)

  res
    .status(200)
    .set(
      "Content-Security-Policy",
      "default-src 'self' ; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws://127.0.0.1:*/"
    )
    .render("overview", {
      title: "All Tours",
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    field: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name!", 404));
  }

  // console.log(tour);

  //2) Build template

  //3) Rener that template from 1)
  res
    .status(200)
    .set(
      "Content-Security-Policy"
      // "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render("tour", {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.login = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      "Content-Security-Policy"
      // "default-src 'self'; connect-src 'self' ws://127.0.0.1:*/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
    )
    .render("loginTemplate", {
      title: "Log into your account",
    });
});

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      "Content-Security-Policy"
      // "default-src 'self'; connect-src 'self' ws://127.0.0.1:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
    )
    .render("account", {
      title: "Your account",
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // console.log(updateUser);
  res.status(200).render("account", {
    status: "success",
    user: updateUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all booking
  const bookings = await Booking.find({ user: req.user.id });
  // console.log(bookings);
  const tourIDs = bookings.map((el) => el.tour);
  // console.log(tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("booked", {
    title: "My booking",
    tours,
  });
  //2) Find tours with the returned IDs
});

exports.singup = catchAsync(async (req, res, next) => {
  res.status(200).set("Content-Security-Policy").render("signup", {
    title: "Signup",
  });
});

exports.createMyReview = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  // console.log(tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  // console.log('4 ranger form review');
  res.status(200).set("Content-Security-Policy").render("review", {
    title: "Review",
    tours,
  });
});
