import { useState, useEffect, useRef } from "react";
import { employeeAPI, leaveAPI } from "../../../api/index";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../../Common/Utils/spinner";
import Header from "../../Common/Header";
import SubNav from "../../Common/Helper/SubNav";
import { setEmpProfile } from "../../../store/empProfileSlice";
import "./index.css";
import { useSelector, useDispatch } from "react-redux";

function Profile() {
  const dispatch = useDispatch();
  const adminProfile = useSelector((state) => state.adminProfile);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  // 👇️ create a ref for the file input
  const inputRef = useRef(null);
  // const [listOfUsers, setListOfUsers] = useState([]);
  const [id, setId] = useState([]);
  const [name, setName] = useState([]);
  const [email, setEmail] = useState([]);
  const [password, setPassword] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [phno, setPhno] = useState([]);
  const [joining, setJoining] = useState([]);
  const [dob, setDob] = useState([]);
  const [profilepic, setProfilepic] = useState("");
  const [profileStatus, setProfileStatus] = useState([]);
  const [isAdminState, setIsAdminState] = useState(false);
  const [data, setData] = useState([]);
  const [dataAdmin, setDataAdmin] = useState([]);
  // const [showForm, setShowForm] = useState(true);
  const [editing, setEditing] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState("");
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [EmpId, setEmpId] = useState([]);
  //const [CurrentUserId, setCurrentUserId] = useState();

  const navigate = useNavigate();

  // const showFormClick = () => {
  //   setShowForm(!showForm);
  // };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setFileToBase(file);
  };

  const setFileToBase = (file) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      // cb(reader.result);
      setProfilepic(reader.result);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };

  /********** delete Profile and profile apply leaves data   ***********/

  const handleDelete = async (id) => {
    try {
      setEditing(false);
      const filteredDataRes = await leaveAPI.getAll();

      const filteredData = filteredDataRes.data.filter(
        (obj) => obj.currentuserid === id
      );

      await Promise.all(
        filteredData.map((item) =>
          //axios.delete("http://localhost:8080/delete/" + item._id)
          leaveAPI.delete(item._id)
        )
      );

      //  await axios.delete("http://localhost:8080/api/employeeinfo/delete/" + id);
      await employeeAPI.delete(id);

      setIsLoading(true);
      toast.info("Employee deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting employee");
    }
  };

  /********** delete Profile and profile apply leaves data   ***********/

  /***************  Update employee infomation  *************/

  const updateEmpInfo = async (event) => {
    event.preventDefault();
    setIsLoadingSpinner(true);
    const filteredDataRes = await leaveAPI.getAll();

    const filteredData = filteredDataRes.data.filter(
      (obj) => obj.currentuserid === taskId
    );

    await Promise.all(
      filteredData.map((item) =>
        leaveAPI.update(item._id, {
          name: name,
        })
      )
    );
    await employeeAPI
      .update(taskId, {
        id: id,
        name: name,
        email: email,
        password: password,
        gender: gender,
        designation: designation,
        phone: phno,
        joiningdate: joining,
        dateofbirth: dob,
        uploaded_file: profilepic,
        profilestatus: profileStatus,
        isAdmin: isAdminState,
      })
      .then((response) => {
        // console.log(response.data);
        setIsLoading(true);
        setIsLoadingSpinner(false);
        setId([]);
        setName([]);
        setEmail([]);
        setPassword([]);
        setGender([]);
        setDesignation([]);
        setPhno([]);
        setJoining([]);
        setProfilepic([]);
        setProfileStatus([]);
        setDob([]);
        // 👇️ reset file input : File input cannot be controlled, there is no React specific way to do that.
        inputRef.current.value = null;
        // setShowForm(false);
        // setError("");
        toast.success("Employee Info Updated successfully");
        document.getElementById("closeProfileModal")?.click();
      })
      .catch(function (error) {
        setIsLoadingSpinner(false);
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          // setError(error.response.data.message);
          toast.warn(error.response.data.message);
        }
      });
  };

  /***************  Update employee infomation  *************/

  /***************  create  employee infomation  *************/

  const createEmpInfo = (event) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    event.preventDefault();
    setIsLoadingSpinner(true);
    employeeAPI
      .create(
        {
          id: id,
          name: name,
          email: email,
          password: password,
          gender: gender,
          designation: designation,
          phone: phno,
          joiningdate: joining,
          dateofbirth: dob,
          uploaded_file: profilepic,
          profilestatus: profileStatus,
          isAdmin: isAdminState,
        },
        config
      )
      .then((response) => {
        setIsLoadingSpinner(false);

        setIsLoading(true);
        setId([]);
        setName([]);
        setEmail([]);
        setPassword([]);
        setGender([]);
        setDesignation([]);
        setPhno([]);
        setJoining([]);
        setProfilepic([]);
        setProfileStatus([]);
        setDob([]);
        // 👇️ reset file input : File input cannot be controlled, there is no React specific way to do that.
        inputRef.current.value = null;
        // setShowForm(false);
        //setError("");
        toast.success("Employee added successfully");
        document.getElementById("closeProfileModal")?.click();
      })
      .catch(function (error) {
        setIsLoadingSpinner(false);

        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          // setError(error.response.data.message);
          toast.warn(error.response.data.message);
        }
      });
  };

  /***************  create  employee infomation  *************/

  useEffect(() => {
    employeeAPI
      .getAll()
      .then((res) => {
        let filteredArray = res.data.filter(function (obj) {
          return obj.isAdmin === false;
        });
        let filteredArray2 = res.data.filter(function (obj) {
          return obj.isAdmin === true;
        });
        let currentUser = res.data
          .filter(function (obj) {
            return obj._id === adminProfile?._id;
          })
          .map(function (obj) {
            return obj._id;
          })
          .join("");
        dispatch(setEmpProfile(res.data));
        setCurrentUser(currentUser);
        setIsLoading(false);
        setData(filteredArray);
        setDataAdmin(filteredArray2);
        //setData(res.data);
      })
      .catch((err) => console.log(err, "it has an error"));
  }, [isLoading, dispatch, adminProfile, serverURL]);

  const toComponentB = (user) => {
    navigate(user._id, { state: { user } });
  };
  const toComponentB2 = (user) => {
    navigate(`${user._id}/${user.name.replace(/\s+/g, "-").toLowerCase()}`, {
      state: { user },
    });
  };

  const removeUploadImg = () => {
    setProfilepic("");
    inputRef.current.value = null;
  };

  /***************  Clear employee infomation after submitted  *************/

  const clear = () => {
    setEditing(false);
    const nextId = (data?.length + dataAdmin?.length + 1).toString();
    setId(nextId);
    setName([]);
    setEmail([]);
    setPassword([]);
    setGender([]);
    setDesignation([]);
    setPhno([]);
    setJoining([]);
    setProfilepic([]);
    setProfileStatus([]);
    setIsAdminState(false);
    setDob([]);
    removeUploadImg();
  };

  /***************  Clear employee infomation after submitted  *************/

  /***************  Handle to edit employee information  *************/

  const handleEdit = (user) => {
    setEditing(true);
    setTaskId(user._id);
    setId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");

    setGender(user.gender);
    setDesignation(user.designation);
    setPhno(user.phone);
    setJoining(new Date(user.joiningdate).toISOString().slice(0, 10));
    setDob(new Date(user.dateofbirth).toISOString().slice(0, 10));
    setProfilepic(user.uploaded_file);
    setProfileStatus(user.profilestatus);
    setIsAdminState(user.isAdmin || false);
    setEmpId(user._id);
  };

  /***************  Handle to edit employee information  *************/
  //console.log(currentUser.toString());
  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />

      <div className="content">
        <div>
          {isLoadingSpinner && <LoadingSpinner />}

          {adminProfile?.isAdmin === true && (
            <button
              // onClick={showFormClick}
              onClick={clear}
              className={styles.add_employee}
              data-bs-toggle="modal"
              data-bs-target="#myModal"
            >
              <i className="fa fa-plus" aria-hidden="true"></i>
              Add employee
            </button>
          )}
          {/* {showForm && ( */}
          <div
            className="modal fade"
            id="myModal"
            role="dialog"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-center">
                    {editing ? "Update employee" : "Add Employee"}
                  </h4>
                  <button
                    onClick={clear}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    id="closeProfileModal"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className={styles.uploadForm}>
                    <div className={styles.popup_content}>
                      <form
                        action="/upload"
                        method="post"
                        encType="multipart/form-data"
                      >
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <div id="firstName">
                              <label className="form-label">Employee ID</label>
                              <input
                                placeholder="Enter your Employee ID"
                                className="form-control"
                                type="text"
                                name="ID"
                                onChange={(event) => {
                                  setId(event.target.value);
                                }}
                                value={id}
                              />
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <div id="Name">
                              <label className="form-label">Name</label>
                              <input
                                // disabled={editing && "disabled"}
                                required=""
                                placeholder="Also your Name"
                                type="text"
                                name="fname"
                                onChange={(event) => {
                                  setName(event.target.value);
                                }}
                                value={name}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <div id="email">
                              <label className="form-label">Email</label>
                              <input
                                //  disabled={editing && "disabled"}
                                required=""
                                placeholder="Enter your Email"
                                type="email"
                                name="email"
                                onChange={(event) => {
                                  setEmail(event.target.value);
                                }}
                                value={email}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <div id="Password">
                              <label className="form-label">Password</label>
                              <div className="input-group">
                                <input
                                  required=""
                                  placeholder="Also your Password"
                                  type={showPassword ? "text" : "password"}
                                  name="password"
                                  onChange={(event) => {
                                    setPassword(event.target.value);
                                  }}
                                  value={password}
                                  className="form-control"
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  style={{ borderLeft: "none" }}
                                  tabIndex="-1"
                                >
                                  <i
                                    className={
                                      showPassword
                                        ? "fa fa-eye-slash"
                                        : "fa fa-eye"
                                    }
                                    aria-hidden="true"
                                  ></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <div id="Designation">
                              <label className="form-label">Designation</label>
                              <input
                                required=""
                                placeholder="Enter your Designation"
                                type="text"
                                name="ID"
                                onChange={(event) => {
                                  setDesignation(event.target.value);
                                }}
                                value={designation}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <div id="phone">
                              <label className="form-label">Phone Number</label>
                              <input
                                required=""
                                placeholder="Also your Phone Number"
                                type="number"
                                name="phone"
                                max="12"
                                onChange={(event) => {
                                  setPhno(event.target.value);
                                }}
                                value={phno}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <label className="form-label">Gender</label>
                            <div className={styles.radio_input}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={gender === "Male"}
                                  name="Gender"
                                  value="Male"
                                  onChange={() => setGender("Male")}
                                  id="flexRadioDefault1"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault1"
                                >
                                  Male
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={gender === "Female"}
                                  name="Gender"
                                  value="Female"
                                  onChange={() => setGender("Female")}
                                  id="flexRadioDefault2"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="flexRadioDefault2"
                                >
                                  Female
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <div id="lastName">
                              <label className="form-label">Joining Date</label>
                              <input
                                required=""
                                placeholder="Also your Joining Date"
                                type="date"
                                name="date"
                                onChange={(event) => {
                                  setJoining(event.target.value);
                                }}
                                value={joining}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <div id="firstName">
                              <label htmlFor="formFile" className="form-label">
                                Profile photo
                              </label>
                              <input
                                className="form-control"
                                ref={inputRef}
                                type="file"
                                name="uploaded_file"
                                id="uploaded_file"
                                onChange={handleImage}
                              />
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <div id="lastName">
                              <label className="form-label">
                                Date Of Birth
                              </label>
                              <input
                                required=""
                                placeholder="Also your DOB"
                                type="date"
                                name="date"
                                onChange={(event) => {
                                  setDob(event.target.value);
                                }}
                                value={dob}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            {profilepic && (
                              <div className={styles.removeImg}>
                                <img id={styles.blah} src={profilepic} alt="" />
                                <div
                                  id={styles.removeImage}
                                  onClick={removeUploadImg}
                                >
                                  <i
                                    className="fa fa-close"
                                    aria-hidden="true"
                                  ></i>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mb-3 col-md-6">
                            <label className="form-label">Profile Status</label>
                            <div className={styles.radio_input}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={profileStatus === "Active"}
                                  name="profileStatus"
                                  value="Active"
                                  onChange={() => setProfileStatus("Active")}
                                  id="Active"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="Active"
                                >
                                  Active
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={profileStatus === "NotActive"}
                                  name="profileStatus"
                                  value="NotActive"
                                  onChange={() => setProfileStatus("NotActive")}
                                  id="NotActive"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="NotActive"
                                >
                                  NotActive
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 col-md-6">
                            <label className="form-label">Role</label>
                            <div className={styles.radio_input}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={isAdminState === false}
                                  name="roleStatus"
                                  value="Employee"
                                  onChange={() => setIsAdminState(false)}
                                  id="EmployeeRole"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="EmployeeRole"
                                >
                                  Employee
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  checked={isAdminState === true}
                                  name="roleStatus"
                                  value="Admin"
                                  onChange={() => setIsAdminState(true)}
                                  id="AdminRole"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="AdminRole"
                                >
                                  Admin
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                      {/* {error && <div>{error}</div>} */}
                    </div>
                  </div>
                </div>
                <div className={`${styles.mod_footer} modal-footer`}>
                  {editing && (
                    <button
                      onClick={updateEmpInfo}
                      className={styles.userBtn}
                    >
                      Update User
                    </button>
                  )}
                  {!editing && (
                    <button
                      onClick={createEmpInfo}
                      className={styles.userBtn}
                    >
                      Create User
                    </button>
                  )}
                  <button
                    onClick={clear}
                    type="button"
                    className={styles.userBtn}
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* )} */}
          <div className="container py-5">
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="pills-home-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-home"
                  type="button"
                  role="tab"
                  aria-controls="pills-home"
                  aria-selected="true"
                >
                  Employee
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="pills-contact-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-contact"
                  type="button"
                  role="tab"
                  aria-controls="pills-contact"
                  aria-selected="false"
                >
                  Admin
                </button>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <div className="row text-center justify-content-center">
                  {data
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((user, index) => {
                      return (
                        <div className="col-xl-3 col-sm-6 mb-5" key={index}>
                          <div
                            className={`bg-white rounded shadow-sm py-3 px-2 ${user.profilestatus !== "Active" && "notactive"
                              }`}
                          >
                            <img
                              src={user.uploaded_file}
                              alt=""
                              width="100"
                              className={`img-fluid  mb-3 ${styles.img_thumbnail} shadow-sm`}
                            />
                            <h5 className="mb-0"> {user.name}</h5>
                            <span className="small text-uppercase text-muted">
                              {user.designation}
                            </span>

                            <div className={styles.view_btn}>
                              <div
                                className={styles.view_cta}
                                onClick={() => {
                                  toComponentB(user);
                                }}
                              >
                                View Profile
                              </div>

                              {(currentUser === user._id || adminProfile?.isAdmin === true) && (
                                <div
                                  className={styles.view_cta}
                                  onClick={() => {
                                    toComponentB2(user);
                                  }}
                                >
                                  View Leaves
                                </div>
                              )}

                              {(currentUser === user._id || adminProfile?.isAdmin === true) && (
                                <div
                                  onClick={() => {
                                    handleEdit(user);
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#myModal"
                                  className={`${styles.view_cta} view_cta_secondary`}
                                >
                                  <i
                                    className="fa fa-pencil-square-o"
                                    aria-hidden="true"
                                  ></i>
                                  Edit user
                                </div>
                              )}

                              {adminProfile?.isAdmin === true && (
                                <div
                                  data-bs-toggle="modal"
                                  data-bs-target="#myModal2"
                                  onClick={() => {
                                    setEmpId(user._id);
                                  }}
                                  className={`${styles.view_cta} view_cta_danger`}
                                >
                                  <i
                                    className="fa fa-trash"
                                    aria-hidden="true"
                                  ></i>
                                  Delete User
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-contact"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                <div className="row text-center">
                  {dataAdmin
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((user, index) => {
                      return (
                        <div className="col-xl-3 col-sm-6 mb-5" key={index}>
                          <div className="bg-white rounded shadow-sm py-3 px-4">
                            <img
                              src={user.uploaded_file}
                              alt=""
                              width="100"
                              className={`img-fluid  mb-3 ${styles.img_thumbnail} shadow-sm`}
                            />
                            <h5 className="mb-0"> {user.name}</h5>
                            <span className="small text-uppercase text-muted">
                              {user.designation}
                            </span>
                            <div className={styles.view_btn}>
                              <div
                                className={styles.view_cta}
                                onClick={() => {
                                  toComponentB(user);
                                }}
                              >
                                View Profile
                              </div>
                              {(currentUser === user._id || adminProfile?.isAdmin === true) && (
                                <div
                                  className={styles.view_cta}
                                  onClick={() => {
                                    toComponentB2(user);
                                  }}
                                >
                                  View Leaves
                                </div>
                              )}

                              {(currentUser === user._id || adminProfile?.isAdmin === true) && (
                                <div
                                  onClick={() => {
                                    handleEdit(user);
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#myModal"
                                  className={`${styles.view_cta} view_cta_secondary`}
                                >
                                  <i
                                    className="fa fa-pencil-square-o"
                                    aria-hidden="true"
                                  ></i>
                                  Edit user
                                </div>
                              )}

                              {adminProfile?.isAdmin === true && (
                                <div
                                  data-bs-toggle="modal"
                                  data-bs-target="#myModal2"
                                  onClick={() => {
                                    setEmpId(user._id);
                                  }}
                                  className={`${styles.view_cta} view_cta_danger`}
                                >
                                  <i
                                    className="fa fa-trash"
                                    aria-hidden="true"
                                  ></i>
                                  Delete User
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <div className="modal fade" id="myModal2">
            <div className="modal-dialog modal-dialog-centered modal-confirm">
              <div className="modal-content">
                <div className="modal-header ">
                  <h4 className="modal-title w-100">Are you sure?</h4>
                  <button
                    onClick={() => {
                      clear();
                    }}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-hidden="true"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Do you really want to delete these records? This process
                    cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => {
                      clear();
                    }}
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleDelete(EmpId);
                      clear();
                    }}
                    data-bs-dismiss="modal"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Profile;
