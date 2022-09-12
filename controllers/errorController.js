const AppError = require("../dev-data/utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  // console.log(message);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again", 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error("ERROR: ", err);
  //B) Rendered Website
  return res.status(err.statusCode).render("errorTemplate", {
    title: "Not Found",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  //Operational, trusted error: send message to client
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        // error: err,
        status: err.status,
        message: err.message,
      });
    }
    //Programing or other unknown error: don't leak error details
    console.log("ERROR", err);
    return res.status(500).json({
      // error: err,
      status: "error",
      message: "Something went very wrong!",
    });
  }
  console.error("ERROR: ", err);
  //B) Render Website
  if (err.isOperational) {
    return res.status(err.statusCode).render("errorTemplate", {
      title: "Not Found",
      msg: err.message,
    });
  }

  //Send generic message
  return res.status(err.statusCode).render("errorTemplate", {
    title: "Not Found",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err };
    // error.message = err.message;
    // console.log(err);
    if (err.name === "CastError")
      // console.log(error);
      err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
    // console.log(error);
    sendErrorProd(err, req, res);
  }
};
