import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import "./index.css";
import axios from "axios";
import Header from "../Header";
import jwt_decode from "jwt-decode";
//import { useNavigate } from "react-router-dom";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubNav from "../Helper/SubNav";
import TodayEmpLeave from "./TodayEmpLeave";
import UpcomingLeave from "./UpcomingLeave";
import { useSelector } from "react-redux";

const serverURL = process.env.REACT_APP_SERVER_URL;

const Main2 = () => {
  const [listOfUsers, setListOfUsers] = useState([]);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [applydate, setapplyDate] = useState("");
  const [absencetype, setAbsencetype] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: null, ascending: true });
  const [appliedUsers, setAppliedUsers] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);

  const adminProfile = useSelector((state) => state.adminProfile);
  const empProfile = useSelector((state) => state.empProfile);
  const currentDate = new Date();
  const oneWeekAfterCurrentDate = new Date(currentDate.getTime());
  oneWeekAfterCurrentDate.setDate(currentDate.getDate() + 7);

  const updateUser = async ({ createdAt, name, status, applydate, _id }) => {
    setName(name);
    setId(_id);
  };

  // Function to handle sorting when the button is clicked
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.ascending) {
      direction = "descending";
    }
    const sorted = [...listOfUsers].sort((a, b) => {
      if (key === "name") {
        return direction === "ascending"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (key === "date") {
        return direction === "ascending"
          ? new Date(a.applydate) - new Date(b.applydate)
          : new Date(b.applydate) - new Date(a.applydate);
      }
      return 0;
    });

    setListOfUsers(sorted);
    setSortConfig({ key, ascending: direction === "ascending" });
  };

  const updateUser2 = async () => {
    setIsLoading(true);
    await axios.put(`${serverURL}/update/${id}`, {
      status: status,
    });
    if (status === "reject") return toast.warning("Leave Rejection");
    if (status === "approve") return toast.success("Leave Approved");
    //navigate("/");
    // localStorage.removeItem("name");
  };

  useEffect(() => {
    // Your logic to get the token
    const token = localStorage.getItem("token"); // Replace with your actual logic to retrieve the token

    // Decode the JWT token
    if (token) {
      const decodedToken = jwt_decode(token);
      setId(decodedToken._id);
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${serverURL}/getusers`)
      .then((response) => {
        let filteredArray = response.data.filter(function (obj) {
          return obj.status === "pending";
        });
        const currentDate = new Date().toISOString().split("T")[0];

        const filteredUsers = response.data.filter(
          (user) =>
            new Date(user.applydate).toISOString().split("T")[0] ===
              currentDate && user.status === "approve"
        );
        const leavesWithinRange = response.data.filter((leave) => {
          const leaveDate = new Date(leave.applydate)
            .toISOString()
            .split("T")[0];
          return (
            leaveDate > currentDate &&
            leaveDate <= oneWeekAfterCurrentDate.toISOString().split("T")[0] &&
            leave.status === "approve"
          );
        });
        setAppliedUsers(filteredUsers);
        setUpcomingLeaves(leavesWithinRange);
        setListOfUsers(filteredArray.reverse());
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isLoading]);

  /************ Create a new leave Apply leave  **********/

  const createUser = () => {
    axios
      .post(`${serverURL}/createuser`, {
        name: adminProfile?.isAdmin === true ? name : adminProfile?.name,
        absencetype: absencetype,
        applydate: applydate,
        // currentuserid: adminProfile?.isAdmin === true ? id : adminProfile._id,
        currentuserid: id,
        status: adminProfile?.isAdmin === true ? "approve" : "pending",
      })
      .then((response) => {
        setIsLoading(true);
        setAbsencetype([]);
        setapplyDate([]);
        toast.success("Leave applied successfully");
      })
      .catch(function (error) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status <= 500
        ) {
          //  setError(error.response.data.message);
          toast.warn(error.response.data.message);
        }
      });
  };

  /************ Create a new leave Apply leave  **********/

  /************ Delete a existing Apply leave  **********/
  const handleDeleteLeave = (id) => {
    axios
      .delete(`${serverURL}/delete/${id}`)
      .then((res) => {
        //console.log(res.data);
        setIsLoading(true);
        toast.info("Leave delete successfully");
      })
      .catch((err) => console.log(err, "it has an error"));
  };

  /************ Delete a existing Apply leave  **********/

  const clear = () => {
    setAbsencetype([]);
    setapplyDate([]);
  };

  const filteredListOfUsers =
    adminProfile?.isAdmin !== true
      ? listOfUsers.filter((obj) => obj.currentuserid === adminProfile?._id)
      : listOfUsers;
  // console.log({ test });

  const calculateOneWeekLater = (apply) => {
    const oneWeekLater = new Date(apply);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    return oneWeekLater.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysDifference = (createdAt, applyDate) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const createdAtDate = new Date(createdAt);
    const applyDateDate = new Date(applyDate);

    const differenceInDays = Math.round(
      Math.abs((createdAtDate - applyDateDate) / oneDayInMilliseconds)
    );

    return differenceInDays;
  };

  console.log(filteredListOfUsers);

  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />
      {/* <Test setState={setTest} /> */}
      <div className="content">
        {adminProfile?.isAdmin === true && (
          <div className="Leave_detail_overAll">
            <TodayEmpLeave name={appliedUsers} />
            <UpcomingLeave list={upcomingLeaves} />
          </div>
        )}
        <button
          className="add_employee"
          data-bs-toggle="modal"
          data-bs-target="#myModal"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          Apply Leave
        </button>
        <div className="modal fade" id="myModal">
          <div className="modal-dialog modal-dialog-centered modal-xs">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-center">Apply Leave</h4>
                <button
                  onClick={clear}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
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
                            <label className="form-label">Employee Name</label>
                            {adminProfile?.isAdmin === true ? (
                              <select
                                value={name}
                                className="form-select"
                                onChange={(event) => {
                                  setName(event.target.value);
                                  setId(
                                    event.target.options[
                                      event.target.selectedIndex
                                    ].getAttribute("data-id")
                                  );
                                }}
                              >
                                <option value="">Select an Name</option>

                                {empProfile.map((user, index) => (
                                  <option
                                    key={user._id}
                                    data-id={user._id}
                                    value={user.name}
                                  >
                                    {user.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="form-control"
                                type="text"
                                value={adminProfile?.name}
                                disabled
                              />
                            )}
                          </div>
                        </div>
                        <div className="mb-3 col-md-6">
                          <div id="Name">
                            <label className="form-label">Apply Date</label>
                            <input
                              className="form-control"
                              type="date"
                              onChange={(event) => {
                                setapplyDate(event.target.value);
                              }}
                              value={applydate}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-12">
                          <div id="firstName">
                            <label className="form-label">
                              Reason For Leave
                            </label>
                            <select
                              className="form-select"
                              id="type"
                              name="type"
                              onChange={(event) => {
                                setAbsencetype(event.target.value);
                              }}
                              value={absencetype}
                            >
                              <option selected="">Select absence type</option>
                              <option value="conference">Conference</option>
                              <option value="parental leave">
                                Parental Leave
                              </option>
                              <option value="maternity leave">
                                Maternity Leave
                              </option>
                              <option value="paternity leave">
                                Paternity Leave
                              </option>
                              <option value="bereavement leave">
                                Bereavement Leave
                              </option>
                              <option value="emergency leave">
                                Emergency Leave
                              </option>
                              <option value="rest day">Rest Day</option>
                              <option value="sick leave">Sick Leave</option>
                              <option value="business trip">
                                Business Trip
                              </option>
                              <option value="paid leave">Paid Leave</option>
                              <option value="unpaid leave">Unpaid Leave</option>
                              <option value="vacation">Vacation Leave</option>
                              <option value="public holiday">
                                Public Holiday
                              </option>
                              <option value="out of office">
                                Out of Office
                              </option>
                              <option value="offset leave">Offset Leave</option>
                              <option value="half day">Half day Leave</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <p></p>
                    </form>
                    {/* {error && <div>{error}</div>} */}
                  </div>
                </div>
              </div>
              <div className={`${styles.mod_footer} modal-footer`}>
                <button
                  onClick={createUser}
                  className={styles.userBtn}
                  data-bs-dismiss="modal"
                >
                  Apply Leave
                </button>

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
        <div className={styles.main_container}>
          <div className="card">
            <div className="card-body">
              <div className="dashboard">
                <table className="table">
                  <thead>
                    <tr>
                      <th>created At</th>
                      <th>
                        Name
                        <i
                          className="fa fa-sort"
                          aria-hidden="true"
                          onClick={() => handleSort("name")}
                        ></i>
                      </th>
                      <th>
                        apply date
                        <i
                          className="fa fa-sort"
                          aria-hidden="true"
                          onClick={() => handleSort("date")}
                        ></i>
                      </th>
                      <th>status</th>
                      <th>Absence type </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListOfUsers.length > 0 ? (
                      filteredListOfUsers.map((user, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {new Date(user.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td>{user.name}</td>
                            {calculateDaysDifference(
                              user.createdAt,
                              user.applydate
                            )}
                            <td>
                              {calculateDaysDifference(
                                user.createdAt,
                                user.applydate
                              ) < 7 ? (
                                <span>
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip className="m-0">
                                        Apply date didn't apply a week ago
                                      </Tooltip>
                                    }
                                  >
                                    <i
                                      className="fa fa-exclamation-triangle text-danger"
                                      aria-hidden="true"
                                    ></i>
                                  </OverlayTrigger>
                                </span>
                              ) : (
                                <span>
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip className="m-0">
                                        Apply date applied a week ago
                                      </Tooltip>
                                    }
                                  >
                                    <i
                                      className="fa fa-check-square text-success"
                                      aria-hidden="true"
                                    ></i>
                                  </OverlayTrigger>
                                </span>
                              )}
                              {new Date(user.applydate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="text-warning">{user.status}</td>
                            <td>{user.absencetype}</td>
                            <td>
                              {adminProfile?.isAdmin === true ? (
                                <button
                                  className="update_btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#myModal2"
                                  onClick={() => {
                                    updateUser(user);
                                  }}
                                >
                                  Update
                                </button>
                              ) : (
                                <button
                                  className="update_btn"
                                  onClick={() => {
                                    handleDeleteLeave(user._id);
                                  }}
                                >
                                  delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <img
                        src="https://res.cloudinary.com/dmkttselw/image/upload/v1689268120/profile/Nodata_czp0rb.png"
                        alt="nodata"
                        className="img-fluid nofound"
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="modal fade" id="myModal2">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title text-center">Status Change</h4>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className={styles.modal_form}>
                    <input
                      className="form-control"
                      type="text"
                      disabled
                      placeholder="name"
                      onChange={(event) => {
                        setName(event.target.value);
                      }}
                      value={name}
                    />

                    <select
                      className="form-select"
                      onChange={(event) => {
                        setStatus(event.target.value);
                      }}
                      value={status}
                    >
                      <option value="pending">pending</option>
                      <option value="approve">approve</option>
                      <option value="reject">reject</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={updateUser2}
                    data-bs-dismiss="modal"
                  >
                    Update
                  </button>
                  {/* <button
                    type="button"
                    className="btn btn-dark"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button> */}
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
        </div>
      </div>
    </>
  );
};

export default Main2;
