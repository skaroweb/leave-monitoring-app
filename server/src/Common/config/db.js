const mongoose = require("mongoose");

module.exports = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URL);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect database!");
    process.exit();
  }
};
