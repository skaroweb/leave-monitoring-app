const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

module.exports = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log(decoded);
    next();
  });
};
