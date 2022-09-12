const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

router
  .route('/:id')
  .get(authController.protect, bookingController.getBooking)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.updateBooking
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.deleteBooking
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.getAllBooking
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.createBooking
  );

module.exports = router;
