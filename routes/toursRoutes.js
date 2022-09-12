const express = require('express');

const tourController = require('../controllers/tourController');

const userController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();
// const {
//   getAllTours,
//   createTour,
//   getTour,
//   updateTour,
//   deleteTour,
// } = require('../controllers/tourController.js');

// route.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stat').get(tourController.getTourStats);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/monthly-plan/:year')
  .get(
    userController.protect,
    userController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(userController.protect, tourController.getAllTours)
  .post(
    userController.protect,
    userController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)

  .patch(
    userController.protect,
    userController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage,
    tourController.updateTour
  )

  .delete(
    userController.protect,
    userController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(userController.protect, userController.restrictTo('user'), reviewController.createReview);

module.exports = router;
