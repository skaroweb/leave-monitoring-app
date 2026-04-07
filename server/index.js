require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const connection = require("./src/Common/config/db");
const userRoutes = require("./src/Auth/routes/users");
const authRoutes = require("./src/Auth/routes/auth");
const employeeInfo = require("./src/Admin/routes/employeeinfo");
const leaveRoutes = require("./src/Employee/routes/leave");
const createDefaultAdmin = require("./src/Common/utils/createDefaultAdmin");

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB connection
connection();

// Default admin
createDefaultAdmin();

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ SINGLE CORS CONFIG (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://leave-monitoring.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employeeinfo", employeeInfo);
app.use("/api/extrawork", require("./src/Employee/routes/extrawork"));

// Server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});