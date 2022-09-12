const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");
const catchAsync = require("../dev-data/utils/catchAsync");
const AppError = require("../dev-data/utils/appError");
const { validate } = require("../models/userModels");
const Email = require("../dev-data/utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  // console.log(token);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    cookie: {
      SameSite: "None",
      Secure: true,
    },
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  user.password = undefined;
  // console.log(cookieOptions);
  // console.log('1 Create token');
  res.cookie("jwt", token, cookieOptions);
  // console.log(token);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  // console.log(newUser);
  // console.log('2');
  // try {
  //   await new Email(newUser, url).sendWelcome();
  // } catch (err) {
  //   console.log(err);
  // }
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Email or password are not exist!", 400));
  }
  //2)Check if user exists && password are correct
  if (!(await User.findOne({ email }))) {
    return next(
      new AppError("Your Email is not exist! Please enter again Email.")
    );
  }
  const user = await User.findOne({ email }).select("+password");

  //error: because if User.findOne({ email }).select('+password') NOT EXIST
  // const correct = await user.correctPassword(password, user.password);

  if (!email || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email or Password are not correct", 401));
  }

  // console.log(user);
  //3) If everything is OK, send token to client
  createSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded);

      //2) Check if user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        next();
      }

      //3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logout = (req, res) => {
  // res.clearCookie('jwt');

  //ERROR: ...
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  // console.log('3 protect');
  try {
    let token;
    // 1) Getting token and check it's there.
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      // console.log(token);
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }
    //2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3) Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belong to this token does no longer exist", 401)
      );
    }

    //4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password. Please log in again", 401)
      );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    // console.log(req.user);
    return next();
  } catch (err) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do no have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address"), 404);
  }
  //2) Generate the random reset token
  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password! Submit a PATCH request with your new password and passwordConfirm to:
    ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    //test API
    // await sendEmail({
    //     email: user.email,
    //     subject: 'Your password reset token (valid for 10 min)',
    //     message
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // console.log(err);
    // return next(
    //   new AppError(
    //     'There was an error sending the email. Try again later!',
    //     500
    //   )
    // );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on Token
  // console.log(req.params.token);
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log(user);

  if (!user) {
    return next(new AppError("Token is not valid or has expired", 400));
  }
  //2) If Token has not exprired, and there is user, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // console.log(user);

  //2) Check if POSTed currentPassword is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current passwrod is wrong", 401));
  }
  // console.log('1');
  //3) if so, update Password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmPassword;

  // console.log(user.password);
  // console.log(user.passwordConfirm);

  await user.save();

  //4) Login user, sent JWT
  createSendToken(user, 200, res);
});
