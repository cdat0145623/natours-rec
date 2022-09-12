const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverView
);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.login);

router.get('/signup', viewsController.singup, authController.signup);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get(
  '/my-tours/form-review',
  authController.protect,
  viewsController.createMyReview
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
