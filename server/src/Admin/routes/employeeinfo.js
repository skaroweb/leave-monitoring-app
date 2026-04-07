// ===============================
// IMPORTS
// ===============================
const router = require("express").Router();
const { employeeinfoModel, validate } = require("../../Common/models/Employeeinfo");
const { admininfoModel } = require("../../Common/models/Admininfo");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cloudinary = require("../../Common/utils/cloudinary");


// ===============================
// MULTER CONFIGURATION
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
});


// ===============================
// CREATE USER (EMPLOYEE / ADMIN)
// ===============================
router.post("/", upload.single("uploaded_file"), async (req, res) => {
  try {
    // Automatically set ID if not provided
    if (!req.body.id || req.body.id === "" || req.body.id === "[]") {
      const employeeCount = await employeeinfoModel.countDocuments();
      const adminCount = await admininfoModel.countDocuments();
      let nextIdNum = employeeCount + adminCount + 1;
      let nextId = nextIdNum.toString();

      // Check if ID exists and increment until a unique one is found
      while (
        (await employeeinfoModel.findOne({ id: nextId })) ||
        (await admininfoModel.findOne({ id: nextId }))
      ) {
        nextIdNum++;
        nextId = nextIdNum.toString();
      }
      req.body.id = nextId;
    }

    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    let user = await employeeinfoModel.findOne({ email: req.body.email });
    if (!user) {
      user = await admininfoModel.findOne({ email: req.body.email });
    }
    if (user)
      return res.status(409).send({ message: "User with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    let uploadedFileUrl = req.body.uploaded_file;
    let cloudinaryId = "";

    try {
      if (process.env.CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(req.body.uploaded_file, {
          folder: "profile",
        });
        uploadedFileUrl = result.secure_url;
        cloudinaryId = result.public_id;
      }
    } catch (err) {
      console.log("Cloudinary upload error:", err.message);
    }

    if (req.body.isAdmin === true || req.body.isAdmin === "true") {
      const newAdmin = new admininfoModel({
        ...req.body,
        password: hashPassword,
        uploaded_file: uploadedFileUrl,
        cloudinary_id: cloudinaryId,
        isAdmin: true,
      });
      await newAdmin.save();
    } else {
      const newEmployee = new employeeinfoModel({
        ...req.body,
        password: hashPassword,
        uploaded_file: uploadedFileUrl,
        cloudinary_id: cloudinaryId,
        isAdmin: false,
      });
      await newEmployee.save();
    }

    res.status(201).send({ message: "User Created Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


// ===============================
// GET ALL USERS
// ===============================
router.get("/", async (req, res) => {
  try {
    const employees = await employeeinfoModel.find({});
    const admins = await admininfoModel.find({});
    res.send([...employees, ...admins]);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Fetching Users" });
  }
});


// ===============================
// GET USER BY ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    let user = await employeeinfoModel.findById(req.params.id);
    if (!user) {
      user = await admininfoModel.findById(req.params.id);
    }

    if (!user)
      return res.status(404).send({ message: "User Not Found" });

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Fetching User" });
  }
});


// ===============================
// UPDATE USER
// ===============================
router.put("/update/:id", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.SALT));

    let existingUser = await employeeinfoModel.findById(req.params.id);
    let modelType = "employee";

    if (!existingUser) {
      existingUser = await admininfoModel.findById(req.params.id);
      modelType = "admin";
    }

    if (!existingUser)
      return res.status(404).send({ message: "User Not Found" });

    let hashPassword;
    if (!req.body.password) {
      hashPassword = existingUser.password;
    } else {
      hashPassword = await bcrypt.hash(req.body.password, salt);
    }

    let uploadedFileUrl = req.body.uploaded_file;
    let cloudinaryId = existingUser.cloudinary_id;

    try {
      if (process.env.CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(req.body.uploaded_file, {
          folder: "profile",
        });
        uploadedFileUrl = result.secure_url;
        cloudinaryId = result.public_id;
      }
    } catch (err) {
      console.log("Cloudinary upload error:", err.message);
    }

    const updateData = {
      ...req.body,
      password: hashPassword,
      uploaded_file: uploadedFileUrl,
      cloudinary_id: cloudinaryId,
    };

    let updatedUser;
    if (modelType === "employee") {
      updatedUser = await employeeinfoModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    } else {
      updatedUser = await admininfoModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    }

    res.send(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Updating User" });
  }
});


// ===============================
// DELETE USER
// ===============================
router.delete("/delete/:id", async (req, res) => {
  try {
    let user = await employeeinfoModel.findById(req.params.id);
    let modelType = "employee";

    if (!user) {
      user = await admininfoModel.findById(req.params.id);
      modelType = "admin";
    }

    if (!user)
      return res.status(404).send({ message: "User Not Found" });

    if (user.cloudinary_id) {
      await cloudinary.uploader.destroy(user.cloudinary_id).catch(() => { });
    }

    if (modelType === "employee") {
      await employeeinfoModel.findByIdAndDelete(req.params.id);
    } else {
      await admininfoModel.findByIdAndDelete(req.params.id);
    }

    res.send({ message: "User Deleted Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Error Deleting User" });
  }
});


// ===============================
module.exports = router;