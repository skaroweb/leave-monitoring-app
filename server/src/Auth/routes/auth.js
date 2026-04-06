const router = require("express").Router();
const { User } = require("../../Common/models/user");
const { employeeinfoModel } = require("../../Common/models/Employeeinfo");
const { admininfoModel } = require("../../Common/models/Admininfo");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

router.post("/", async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const inputEmail = req.body.email.toLowerCase();
    const inputPassword = req.body.password;

    // Admin bypass logic using .env config for security
    const rawAdminEmail = process.env.ADMIN_EMAIL || "tester@skarosoft.com";
    const rawAdminPassword = process.env.ADMIN_PASSWORD || "Tester@skarosoft123";

    const adminEmail = rawAdminEmail.replace(/["']/g, "").trim().toLowerCase();
    const adminPassword = rawAdminPassword.replace(/["']/g, "").trim();

    if (inputEmail.trim() === adminEmail && inputPassword.trim() === adminPassword) {
      let bypassAdmin = await admininfoModel.findOne({ email: inputEmail });

      if (!bypassAdmin) {
        bypassAdmin = new admininfoModel({
          id: "ADMIN-FIRST",
          name: "Super Admin",
          email: inputEmail,
          password: await bcrypt.hash(adminPassword, await bcrypt.genSalt(10)),
          gender: "Male",
          designation: "Administrator",
          phone: 1234567890,
          joiningdate: new Date(),
          dateofbirth: new Date(),
          isAdmin: true,
          uploaded_file: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfI3L5VjB5A_9Q4RzR5e06KzY_K6K7S0mDtw&s",
          profilestatus: "Active"
        });
        await bypassAdmin.save();
      }

      const token = bypassAdmin.generateAuthToken();
      console.log("[auth] bypass admin login", {email: bypassAdmin.email});
      return res.status(200).send({
        data: token,
        email: bypassAdmin.email,
        isAdmin: bypassAdmin.isAdmin,
        message: "logged in successfully via default admin",
      });
    }

    const searchEmailRegex = new RegExp(`^${req.body.email.trim()}$`, "i");
    let user = await employeeinfoModel.findOne({ email: searchEmailRegex });

    if (!user) {
      user = await admininfoModel.findOne({ email: searchEmailRegex });
    }

    if (!user) {
      console.warn("[auth] user not found for email:", req.body.email);
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    let validPassword = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      validPassword = await bcrypt.compare(req.body.password, user.password);
    } else {
      validPassword = req.body.password === user.password;
    }

    if (!validPassword) {
      console.warn("[auth] password mismatch for email:", req.body.email);
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    const token = user.generateAuthToken();
    const email = req.body.email;

    console.log("[auth] login success", { email, isAdmin: user.isAdmin, userId: user._id });

    return res.status(200).send({
      data: token,
      email: email,
      isAdmin: user.isAdmin,
      message: "logged in successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(error);
  }
});

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
