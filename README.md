<<<<<<< HEAD
# Leave-Monitoring-App
Leave Monitoring App is a full-stack MERN application that allows employees to apply for leave and admins to manage, approve, or reject requests. It includes authentication, role-based access, and real-time leave tracking.
=======
# Leave Monitoring App

A comprehensive full-stack web application designed to track and manage employee performance, attendance, leave requests, extra work, and WFH statuses. 

## 🌟 Key Features

### 👤 Employee Dashboard
* **Profile Management:** View overall profile details.
* **Leave Requests:** Apply for various types of leave (Sick leave, Maternity, etc.).
* **Extra Work:** Submit extra work requests with expected hours and dates.
* **Work From Home (WFH):** Log WFH hours and descriptions.
* **Permissions:** Submit detailed permission requests.

### 👑 Admin Dashboard
* **Employee Overview:** View all employees and their operational statuses.
* **Detailed Tracking:** Validate and manage employee Leave, Extra Work, WFH, and Permission requests (Accept/Reject/Pending).
* **User Management:** Add and register new employees, assign roles (Admin/Employee), edit user details, and manage/reset user passwords.
* **Reporting:** Downloadable leave reporting.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (v18.2)
- **Styling & Components:** React Bootstrap, Ant Design, Bootstrap v5
- **State Management:** Redux (redux-thunk, @reduxjs/toolkit)
- **Routing:** React Router DOM (v6)
- **Charts & Data:** Chart.js, react-chartjs-2, xlsx, jsPDF

### Backend
- **Environment:** Node.js, Express.js (v4.18)
- **Database:** MongoDB & Mongoose (v7)
- **Authentication & Security:** JWT (jsonwebtoken), bcryptjs, Joi validation
- **Storage:** Cloudinary (for image uploads), Multer (file handling)
- **Utilities:** dotenv, cors, cookie-parser

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/try/download/community)

### 2. Clone and Setup
Extract or clone the project files to your local machine.

### 3. Install Dependencies
You can install both 'server' and 'client' packages at the same time by running this command at the root directory:
```bash
npm run install:all
```
*(This triggers the `npm install --prefix server` and `npm install --prefix client` commands concurrently).*

### 4. Environment Variables
Create a `.env` file in the `/server` directory and add your connection strings:
```env
PORT=8080
DB=<your-mongodb-uri>
JWTPRIVATEKEY=<your-secret-key>
# Cloudinary Credentials (if applicable)
```

### 5. Running the Application
To run both the server and the frontend client simultaneously in development mode, use:
```bash
npm start
```
The client app should start on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).
The backend API server typically runs on `http://localhost:8080`.

## 📂 Project Structure

```
├── client/          # React frontend application
│   ├── public/      # Public assets
│   ├── src/         # React components, pages, Redux store, API routes
│   └── package.json 
├── server/          # Express/Node backend application
│   ├── src/         # Controllers, Routes, Models, Middlewares
│   ├── uploads/     # Local multer storage
│   ├── .env         # Env variables for backend
│   └── package.json
├── package.json     # Root package.json to run both apps concurrently
└── README.md        # This documentation
```
>>>>>>> 8d9f3bf (Initial commit - Leave Monitoring App)
