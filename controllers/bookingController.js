const Tour = require('../models/tourModels');
const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const catchAsync = require('../dev-data/utils/catchAsync');
const AppError = require('../dev-data/utils/appError');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');

const stripe = require('stripe')(
  'sk_test_51Lc2TPIFDKjBGOaxf9sdHlRDPY9nrMT2BIZ3PwA3i4Trj0iIJyGDvYSlVgAuvIF29IO1UW42VLJBHr1Ws3GXyxd900vzQnuI9E',
  {
    apiVersion: '2022-08-01',
  }
);

// const promisify = require('util');

// const stripe = require('stripe')(process.env.STRIPE_KEY);

// var charge = await stripe.charges.retrieve('ch_3Lc5LGIFDKjBGOax0WfS0TIK', {
//     apiKey:
//       'sk_test_51Lc2TPIFDKjBGOaxAyMS9VKMD6KQBDy25ND4DHJU0f9zlgP1tHwULv1vREhQkhk0N1FtYPLGtKo3Qd3UTW1VnJHp00Y88wYInQ',
//   });

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  console.log('5');
  console.log(req.params.tourId);
  const tour = await Tour.findById(req.params.tourId);
  //
  const jwt = req.cookies.jwt;
  console.log(jwt);
  console.log(req.user.email);
  // const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

  // console.log(decoded);
  // const currentUser = await User.findById(decoded.id);
  // console.log(currentUser);
  // console.log(currentUser.email);

  //2) Create Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&pice=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name}`,
            description: tour.summary,
            // images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // name: `${tour.name}`,
  //       description: tour.summary,
  //       images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
  //       amount: tour.price * 100,
  //       currency: 'usd',

  //3)

  res.status(200).json({
    status: 'success',
    session,
  });
});
// price_data: [{ amount: tour.price * 100 }],
// price_data: [{ currency: 'usd' }],
// price_data: [{ name: `${tour.name}` }],
// price_data: [{ description: tour.summary }],
// price_data: [{ quantity: 1 }],

exports.createBookingCheckout = async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  }
  console.log(req.originalUrl);
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
};

exports.createBooking = factory.createOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
