const User = require("../models/userModels");
const catchAsync = require("../dev-data/utils/catchAsync");
const AppError = require("../dev-data/utils/appError");
const factory = require("./handlerFactory");
const sharp = require("sharp");
const multer = require("multer");

// const upload = multer({ dest: 'starter/public/img/users' });

//set link upload file
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'starter/public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

//Filter image (chua toi uu)
const multerFilter = (req, file, cb) => {
  // console.log(file.mimetype);
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new AppError("File is not image", 400), false);
  }
};

//Upload file image
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  // req.user.id;
  req.file.filename = `user - ${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`starter/public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowsFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowsFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single("photo");

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // req.file;
  // console.log(req.body);
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password update. Please use /updateMyPassword",
        400
      )
    );
  }

  //2) Filtered out unwanted fields names that are not allowed to be update
  const filteredBody = filterObj(req.body, "name", "email");
  // Add photo to filteredBody
  if (req.file) filteredBody.photo = req.file.filename;
  //3) Update document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use/signup instead!!!",
  });
};

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
