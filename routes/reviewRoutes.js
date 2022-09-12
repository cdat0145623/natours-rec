const express = require('express');

const reviewManager = require('../controllers/reviewController');

const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewManager.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewManager.setTourandId,
    reviewManager.createReview
  );

router
  .route('/:id')
  .get(reviewManager.getReview)
  .patch(authController.restrictTo('user', 'admin'), reviewManager.updateReview)
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    reviewManager.deleteReview
  );

module.exports = router;
