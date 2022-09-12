const path = require("path");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const AppError = require("./dev-data/utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const toursRoute = require("./routes/toursRoutes");
const usersRoute = require("./routes/usersRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const viewsRoute = require("./routes/viewsRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const app = express();

//Start aaaa
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./public/views"));

// "start": "nodemon server.js",
// "start:prod": "NODE_ENV=production nodemon server.js"
// "test": "echo \"Error: no test specified\" && exit 1"
// 1) MIDDLEWARES

//Con me
app.use(express.static(path.join(__dirname, "./public")));
// console.log(process.env.NODE_ENV);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "ws:",
          "https://*.mapbox.com",
        ],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        scriptSrc: [
          "'self'",
          "https:",
          "http:",
          "blob:",
          "https://*.mapbox.com",
          "'unsafe-inline'",
          "https://js.stripe.com",
          "https://m.stripe.network",
          "https://*.cloudflare.com",
          "https://js.stripe.com/v3/",
        ],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.tiles.mapbox.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://m.stripe.network",
        ],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:"],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://*.mapbox.com",
          "https://*.cloudflare.com/",
          "https://bundle.js:*",
          "ws://127.0.0.1:*/",
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windoeMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in hour.",
});

app.use("/api", limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(
  cookieSession({
    keys: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      SameSite: "Lax",
      Secure: true,
      maxAge: 1000 * 60 * 60 * 60,
    },
  })
);

// app.use(

// );

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "difficulty",
      "maxGroupSize",
      "price",
    ],
  })
);

//Serving static files

// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Hello from the server", app: "natours" });
// });

// app.use((req, res, next) => {
//   console.log("Hello from the middle ware");
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2)) ROUTE HANDLER

// USER------------------------------

// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

// 3) ROUTES

// ROUTES TOURS

//ROUTES USERS

app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/", viewsRoute);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;
  try {
  } catch (err) {
    console.log(err);
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  }
});

app.use(globalErrorHandler);

module.exports = app;

// 4) START SERVER
