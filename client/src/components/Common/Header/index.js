/* eslint-disable */
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import { useState } from "react";
//import styles from "../../Employee/Main/styles.module.css";
import styles from "./index.module.css";
import "./index.css";

function Header() {
  const [click, setClick] = useState(false);
  const adminProfile = useSelector((state) => state.adminProfile);

  const handleClick = () => setClick(!click);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    //window.location.reload();
    document.location.replace("/");
  };

  return (
    <>
      <nav className="navbar-theme-primary px-4 d-md-none navbar navbar-dark">
        <a className="me-lg-5 navbar-brand" href="#/dashboard/overview">
          <img
            src="https://res.cloudinary.com/dmkttselw/image/upload/v1687241682/profile/skaro_fbpjz6.png"
            className="navbar-brand-light"
            alt=""
          />
        </a>
        <div className="nav-icon" onClick={handleClick}>
          <i className={click ? "fa fa-times" : "fa fa-bars"}></i>
        </div>
      </nav>
      <div
        className={`sidebar-inner px-4 pt-3 ${click === true ? "active" : ""}`}
      >
        <div className="flex-column pt-3 pt-md-0 nav">
          <nav className={styles.navbar}>
            <img
              src="https://res.cloudinary.com/dmkttselw/image/upload/v1687345584/profile/skaro-symbol-logo_ardzcd.png"
              className={styles.navbar_brand_light}
              alt=""
            />
            <h1>Skaro</h1>
            <ul className={styles.header_nav}>
              <li>
                <NavLink
                  to={adminProfile?.isAdmin ? "/admin" : "/employee"}
                  className={({ isActive }) =>
                    isActive ? "NavActive" : "inactive"
                  }
                >
                  <i className="fa fa-pie-chart" aria-hidden="true"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? "NavActive" : "inactive"
                  }
                >
                  <i className="fa fa-users" aria-hidden="true"></i>
                  <span>Profile</span>
                </NavLink>
              </li>
              {adminProfile?.isAdmin !== true && (
                <li>
                  <NavLink
                    to="/apply-extra-work"
                    className={({ isActive }) =>
                      isActive ? "NavActive" : "inactive"
                    }
                  >
                    <i className="fa fa-tasks" aria-hidden="true"></i>
                    <span>Apply Extra Work</span>
                  </NavLink>
                </li>
              )}
              {adminProfile?.isAdmin === true && (
                <li>
                  <NavLink
                    to="/wfh"
                    className={({ isActive }) =>
                      isActive ? "NavActive" : "inactive"
                    }
                  >
                    <i className="fa fa-home" aria-hidden="true"></i>
                    <span>WFH</span>
                  </NavLink>
                </li>
              )}
              {adminProfile?.isAdmin === true && (
                <li>
                  <NavLink
                    to="/overall-report"
                    className={({ isActive }) =>
                      isActive ? "NavActive" : "inactive"
                    }
                  >
                    <i className="fa fa-bar-chart" aria-hidden="true"></i>
                    <span>Overall Report</span>
                  </NavLink>
                </li>
              )}

              {/* Extra Work Status */}
              {adminProfile?.isAdmin === true && (
                <li>
                  <NavLink
                    to="/extra-work-status"
                    className={({ isActive }) =>
                      isActive ? "NavActive" : "inactive"
                    }
                  >
                    <i className="fa fa-tasks" aria-hidden="true"></i>
                    <span>Extra Work Status</span>
                  </NavLink>
                </li>
              )}

              <li>
                <button onClick={handleLogout}>
                  <i className="fa fa-power-off" aria-hidden="true"></i>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
export default Header;

