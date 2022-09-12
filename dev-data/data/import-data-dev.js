const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require('../../models/tourModels');
const User = require('../../models/userModels');
const Review = require('../../models/reviewModel');

dotenv.config({ path: "./config.env" });

console.log(process.env);
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
  })
    .then(() => console.log("DB connection successful!"));


  
//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const userKate = JSON.parse(fs.readFileSync(`${__dirname}/userkate.json`, 'utf-8'));


const ImportData = async () => {
    try {
        // await Tour.create(tours);
        // await User.create(users, {validateBeforeSave: false});
        // await Review.create(reviews);
        await User.create(userKate, { validateBeforeSave: false });
        console.log('Data successful');

    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted');
        
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    ImportData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

