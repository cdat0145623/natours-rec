const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down.......!");
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./app");
dotenv.config({ path: "./config.env" });

// console.log(process.env);
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

// const connectionString = process.env.DATABASE_LOCAL;

// if (!connectionString) {
//   console.error("MongoDB connection string missing!");
//   process.exit(1);
// }
// mongoose.connect(connectionString, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", (err) => {
//   console.error("MongoDB error: " + err.message);
//   process.exit(1);
// });
// db.once("open", () => console.log("MongoDB connection established"));

// const testTour = new Tour({
//   name: "The Park Camper",
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("ERROR", err);
//   });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// process.on("unhandledRejection", (err) => {
//   console.log(err.name, err.message);
//   console.log("UNHANDLEDREJECTION! Shutting down.....!");
//   server.close(() => {
//     process.exit(1);
//   });
// });
