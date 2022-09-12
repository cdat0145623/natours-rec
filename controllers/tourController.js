const Tour = require("../models/tourModels");
const catchAsync = require("../dev-data/utils/catchAsync");
const AppError = require("../dev-data/utils/appError");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

//upload file (buffer)
const multerStorage = multer.memoryStorage();
//Filter File

const multerFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new AppError("File is not image (jpeg)", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  //find img.jpeg
  //1) imageCover and images
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  //Set up the name of file.jpeg
  //2) Set up name of imageCover
  // console.log(req.files.imageCover[0].buffer);
  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  //resize image.jpeg (sharp)
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`starter/public/img/tours/${imageCoverFileName}`);
  //update file into your database
  req.body.imageCover = imageCoverFileName;

  //3) images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const imagesFileName = `tour-${req.params.id}-${Date.now()}-${
        index + 1
      }.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`starter/public/img/tours/${imagesFileName}`);

      req.body.images.push(imagesFileName);
      // console.log(req.body.images);
    })
  );
  next();
});

// upload.single('imageCover');
// upload.array('images', 5);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,rating,price,ratingsAverage,summary,difficulty";
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};

exports.getAllTours = factory.getAll(Tour);
// try {

// //BUILD QUERY
// //1A) FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach(el => delete queryObj[el]);

// //1B) Advanced filtering
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));

// //2)Sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

// //3)Fieled sortting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

//4)Pagination
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 10;
// const skip = (page - 1) * limit;
// console.log(skip);
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   console.log(numTours);
//   if (skip >= numTours) throw new Error('This page is not exist');
// }

// const query = Tour.find(JSON.parse(queryStr) );

// const tours = await query;

// const tours = await Tour.find({
//   duration: 5,
//   difficulty: "easy"
// });

// const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
// console.log(req.requestTime);
// const tours = await Tour.find();

//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err
//     })
//   }
// };

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTour: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: {_id: {$ne: 'easy'} }
    // }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //     })
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});
// catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err
//   })
// }

exports.getTour = factory.getOne(Tour, { path: "reviews" });
// console.log(req.params);
// const id = req.params.id * 1;

// const tour = tours.find((el) => el.id === id);
// if (!tour) {
//   return res.status(404).json({
//     status: 'fail',
//     message: 'Invalid ID',
//   });
// }
// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });
// try {

//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('No tour find with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   })
// });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err
//     })
//   }
// };

exports.createTour = factory.createOne(Tour);
// try {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err
//     })
//   }
// });
// data: {
//   tour: newTour,
// },

//   console.log(req.body);
//   res.send("Done");

//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);

//   fs.writeFile(
//     `./starter/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

///tours-within/20/center/10.7069754,106.6222165/unit/mi
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng.",
        400
      )
    );
  }

  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//'distances/:latlng/unit/:unit'

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat, lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
