const mongoose = require("mongoose");

module.exports = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Connected to database successfully");
    })
    .catch((error) => {
      console.log(error);
      console.log("Could not connect database!");
      // process.exit() is avoided on remote servers if possible, or it exits with 1
    });
};
