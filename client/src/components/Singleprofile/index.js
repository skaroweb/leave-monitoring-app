// import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// import Modal from "react-bootstrap/Modal";
import Header from "../Header";
import SubNav from "../Helper/SubNav";
import "./index.css";
import { useSelector } from "react-redux";
// import axios from "axios";

const ViewUserDetails = () => {
  const [specificUser, setSpecificUser] = useState([]);
  const { id } = useParams();
  const adminProfile = useSelector((state) => state.adminProfile);

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/profile"); // Replace '/profile' with your actual profile page route
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/employeeinfo/${id}`
        );
        const profile = await response.data;

        setSpecificUser(profile);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />
      <div className="content">
        <div className="single_profile">
          {/* <UpdateSingleProfile user={params} /> */}
          <div className="single_profile_img">
            {<img src={specificUser.uploaded_file} alt="test" />}
          </div>
          <div className="emp_name_designation">
            <span className="subheading">Hi There!</span>
            <h1 className="mb-4">
              {specificUser.name} <br />
              <span>{specificUser.designation}</span>
            </h1>
          </div>
          <div className="emp_details">
            <div>
              <i className="fa fa-envelope-o" aria-hidden="true"></i>
              {specificUser.email}
            </div>
            <div>
              <i className="fa fa-calendar" aria-hidden="true"></i>
              {new Date(specificUser.joiningdate).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>
              <i className="fa fa-phone" aria-hidden="true"></i>
              {specificUser.phone}
            </div>
            {/* <button onClick={handleGoBack}>Go Back</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewUserDetails;
