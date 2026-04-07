/* eslint-disable */
import { useEffect, useState } from "react";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { employeeAPI } from "./api/index";

import Dashboard from "./components/Employee/Dashboard";

import Login from "./components/Auth/Login";

import OverallReport from "./components/Admin/OverallReport";
import ExtraWorkStatus from "./components/Admin/ExtraWork";
import Profile from "./components/Employee/Profile";
import ApplyExtraWork from "./components/Employee/ApplyExtraWork/ApplyExtraWork";

import ViewUserDetails from "./components/Admin/SingleProfile";
import EmpLeaves from "./components/Admin/SingleProfile/EmployeeLeaves";
import My404Component from "./components/Common/404";

import "./app.css";
import { useDispatch, useSelector } from "react-redux";
import { setAdminProfile } from "./store/adminProfileSlice";
import { setEmpProfile } from "./store/empProfileSlice";
import WFH from "./components/Admin/WFH";

function App() {
  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [adminMain, setAdminMain] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const dispatch = useDispatch();
  const location = useLocation();
  const adminProfile = useSelector((state) => state.adminProfile);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  // const [boxes, setBoxes] = useState([]);
  // const user = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    console.log("[App] tokenFromStorage:", tokenFromStorage);
    setToken(tokenFromStorage);

    if (!tokenFromStorage) {
      console.warn("[App] no token found in localStorage");
      setIsProfileLoading(false);
      return;
    }

    try {
      const decodedToken = jwt_decode(tokenFromStorage);
      console.log("[App] decodedToken:", decodedToken);
      const resolvedUserId = decodedToken._id || decodedToken.id || decodedToken.userId;

      if (resolvedUserId) {
        setCurrentUserId(resolvedUserId);
        console.log("[App] currentUserId set to:", resolvedUserId);
      } else {
        console.error("[App] no valid userId in JWT payload");
        setProfileError("Invalid token user ID");
        setIsProfileLoading(false);
      }
    } catch (error) {
      console.error("[App] jwt_decode failed:", error);
      setProfileError(error.message || "Failed to decode JWT");
      setIsProfileLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUserId) {
        console.warn("[App] currentUserId is empty, skipping profile fetch");
        if (token) {
          console.warn("[App] token exists but currentUserId is missing");
        }
        setIsProfileLoading(false);
        return;
      }

      try {
        console.log("[App] fetching profile for userId:", currentUserId);
        const response = await employeeAPI.getById(currentUserId);
        const EmpAll = await employeeAPI.getAll();

        const Admin = EmpAll.data
          .filter((currentValue) => currentValue.isAdmin === true)
          .map((currentValue) => currentValue.email);

        setAdminMain(Admin.join(", "));

        const profile = response.data;
        dispatch(setAdminProfile(profile));
        dispatch(setEmpProfile(EmpAll.data));
      } catch (error) {
        console.error("[App] error fetching profile data:", error);
        setProfileError(error.message || "Profile fetch failed");
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchCurrentUserProfile();
  }, [currentUserId, serverURL, dispatch, token]);
  //console.log(adminProfile.isAdmin === true);

  if (email && isProfileLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {email && <Route path="/" exact element={<Dashboard />} />}

        {/* {user && <Route path="/" exact element={<Main />} />} */}
        {!email && (
          <Route path="/" element={<Navigate replace to="/login" />} />
        )}

        <Route path="/login" exact element={<Login />} />
        {/* {email === admin && <Route path="/update" exact element={<Update />} />} */}

        <Route
          path="/admin"
          element={
            email && !isProfileLoading && adminProfile?.isAdmin ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/employee"
          element={
            email && !isProfileLoading && !adminProfile?.isAdmin ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {adminProfile?.isAdmin && (
          <Route exact path="/overall-report" element={<OverallReport />} />
        )}
        {adminProfile?.isAdmin && (
          <Route exact path="/extra-work-status" element={<ExtraWorkStatus />} />
        )}

        {!adminProfile?.isAdmin && (
          <Route exact path="/apply-extra-work" element={<ApplyExtraWork />} />
        )}

        {adminProfile?.isAdmin && (
          <Route exact path="/wfh" element={<WFH />} />
        )}
        <Route path="/profile" exact element={<Profile />} />
        {email && (
          <Route exact path="/profile/:id" element={<ViewUserDetails />} />
        )}
        <Route exact path="/profile/:id/:id" element={<EmpLeaves />} />

        <Route path="*" element={<My404Component />} />
      </Routes>
    </div>
  );
}

export default App;

