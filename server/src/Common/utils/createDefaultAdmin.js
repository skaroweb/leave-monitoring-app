const bcrypt = require("bcryptjs");
const { admininfoModel } = require("../models/Admininfo");

const createDefaultAdmin = async () => {
    try {
        // Check if an admin already exists
        const adminExists = await admininfoModel.findOne();

        if (!adminExists) {
            console.log("No admin found. Creating default admin...");

            // Default credentials
            const email = process.env.ADMIN_EMAIL;
            const plainPassword = process.env.ADMIN_PASSWORD;

            // Hash the password securely
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);

            // Create new admin user
            const defaultAdmin = new admininfoModel({
                id: "ADMIN-001",
                name: "Super Admin",
                email: email,
                password: hashedPassword,
                gender: "Male",
                designation: "Administrator",
                phone: 1234567890,
                joiningdate: new Date(),
                dateofbirth: new Date(),
                isAdmin: true,
                uploaded_file: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfI3L5VjB5A_9Q4RzR5e06KzY_K6K7S0mDtw&s",
                profilestatus: "Active",
            });

            await defaultAdmin.save();
            console.log("Default admin created successfully with email:", email);
        } else {
            console.log("Admin user already exists. Skipping creation.");
        }
    } catch (error) {
        console.error("Error creating default admin:", error.message);
    }
};

module.exports = createDefaultAdmin;
