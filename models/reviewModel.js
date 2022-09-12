const mongoose = require('mongoose');
const Tour = require('./tourModels');
const factory = require('../controllers/handlerFactory');

// review/ rating / createdAt/ ref to tour/ ref to user
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to A Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to A User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });
  next();
});

//Basic
// reviewSchema.statics.calcAverageRatings = async function (tourId) {

//     const stats = await this.aggregate([
//         {
//             $match: { tour: tourId }
//         },
//         {
//             $group: {
//                 _id: '$tour',
//                 nRating: { $sum: 1 },
//                 avgRating: { $avg: '$rating' }
//             }
//         }
//     ])
//     console.log(stats);

//     // if (stats.length > 0) {
//     //     const filter = { _id: mongoose.Types.ObjectId(tourId) };
//     //     const data = {
//     //         ratingsQuantity: stats[0].nRating,
//     //         ratingsAverage: stats[0].avgRating
//     //     };
//     //     // await Tour.findByIdAndUpdate(filter, data);
//     //     await Tour.updateOne(filter, data);
//     // }
//     // await Tour.findByIdAndUpdate(tourId, {
//     //     ratingsQuantity: stats[0].nRating,
//     //     ratingsAverage: stats[0].avgRating
//     // });

// };

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
};

reviewSchema.post('save', async function () {
  //this point to current review

  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate
//findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
