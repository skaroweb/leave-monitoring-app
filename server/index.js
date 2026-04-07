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

app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

// database connection
connection();

// Create default admin on startup
createDefaultAdmin();

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));


app.use(cors({
  origin: "https://leave-monitoring-app-4izu.onrender.com",
  credentials: true
}));



// routes
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employeeinfo", employeeInfo);
app.use("/api/extrawork", require("./src/Employee/routes/extrawork"));

// server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});