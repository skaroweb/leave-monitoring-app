const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
var Schema = mongoose.Schema;

const employeeinfoSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    joiningdate: {
      type: Date,
      required: true,
    },
    dateofbirth: {
      type: Date,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // uploaded_file: {
    //   type: String,
    // },
    uploaded_file: {
      type: String,
      required: true,
    },
    cloudinary_id: {
      type: String,
    },
    profilestatus: {
      type: String,
      required: true,
    },
    availablePermissionTime: {
      type: Number,
      default: 0,
    },
    availableExtraWorkTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
employeeinfoSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};
const employeeinfoModel = mongoose.model("employeeinfo", employeeinfoSchema);   // employeeinfo is the name of the collection in the database

const validate = (data) => {
  const schema = Joi.object({
    id: Joi.string().required().label("Id"),
    name: Joi.string().required().label("Name"),
    email: Joi.string().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    gender: Joi.string().required().label("Gender"),
    designation: Joi.string().required().label("Designation"),
    phone: Joi.number().required().label("Phone"),
    joiningdate: Joi.date().required().label("Joining Date"),
    dateofbirth: Joi.date().required().label("Date of Birth"),
    uploaded_file: Joi.string().required().label("Profile Photo"),
    profilestatus: Joi.string().required().label("profile status"),
    isAdmin: Joi.boolean().label("Is Admin"),
  });

  return schema.validate(data);
};

module.exports = { employeeinfoModel, validate };
