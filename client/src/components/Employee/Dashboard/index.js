import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import "./index.css";
import { leaveAPI } from "../../../api/index";
import Header from "../../Common/Header";
import { jwtDecode as jwt_decode } from "jwt-decode";
//import { useNavigate } from "react-router-dom";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubNav from "../../Common/Helper/SubNav";
import TodayEmpLeave from "./TodayEmpLeave";
import UpcomingLeave from "./UpcomingLeave";
import { useSelector } from "react-redux";
import TodayEmpWFH from "./TodayEmpWFH";

const serverURL = process.env.REACT_APP_SERVER_URL;

const Main2 = () => {
  const [listOfUsers, setListOfUsers] = useState([]);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [applydate, setapplyDate] = useState(getTodayDate());
  const [permissionTime, setPermissionTime] = useState();
  const [workfromhome, setWorkfromhome] = useState();
  const [reason, setReason] = useState([]);
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

  const [selectedDates, setSelectedDates] = useState([]);

  const updateUser = async ({ createdAt, name, status, applydate, _id }) => {
    setSelectedUserName(name);
    setSelectedUserId(_id);
  };

  const formatTime = (value) => {
    let val = value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      return val.slice(0, 2) + ":" + val.slice(2);
    }
    return val;
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
    await leaveAPI.update(selectedUserId, {
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
    leaveAPI
      .getAll()
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
            leave.status === "approve" &&
            leave.reason !== "Permission" &&
            leave.reason !== "WFH"
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

  const createUser = async () => {
    if (reason === "WFH" && !workfromhome) return toast.warn("Please enter WFH Time in HH:MM");
    if (reason === "Permission" && !permissionTime) return toast.warn("Please enter Permission Time in HH:MM");

    try {
      const targetDates = selectedDates;

      if (targetDates.length === 0) {
        return toast.warn("Please select at least one date.");
      }

      setIsLoading(true);

      if (name === "All Employees") {
        const activeUsers = empProfile.filter((user) => user.profilestatus === "Active");

        for (const user of activeUsers) {
          for (const date of targetDates) {
            await leaveAPI.create({
              name: user.name,
              absencetype: absencetype,
              applydate: date,
              reason: reason,
              permissionTime: permissionTime,
              workFromHome: workfromhome,
              currentuserid: user._id,
              status: "approve",
            });
          }
        }
      } else {
        for (const date of targetDates) {
          await leaveAPI.create({
            name: adminProfile?.isAdmin === true ? name : adminProfile?.name,
            absencetype: absencetype,
            applydate: date,
            reason: reason,
            permissionTime: permissionTime,
            workFromHome: workfromhome,
            // currentuserid: adminProfile?.isAdmin === true ? id : adminProfile._id,
            currentuserid: id,
            status: adminProfile?.isAdmin === true ? "approve" : "pending",
          });
        }
      }

      setIsLoading(false);
      clear();
      setReason("");
      setPermissionTime("");
      setWorkfromhome("");
      toast.success("Applied successfully");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        toast.warn(error.response.data.message);
      }
      setIsLoading(false);
    }
  };

  /************ Create a new leave Apply leave  **********/

  /************ Delete a existing Apply leave  **********/
  const handleDeleteLeave = (id) => {
    leaveAPI
      .delete(id)
      .then((res) => {
        //console.log(res.data);
        setIsLoading(true);
        toast.info("Leave delete successfully");
      })
      .catch((err) => console.log(err, "it has an error"));
  };

  /************ Delete a existing Apply leave  **********/

  const clear = () => {
    setAbsencetype("");
    setapplyDate(getTodayDate());
    setSelectedDates([]);
    setName("");
    setId("");
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

  //  console.log(filteredListOfUsers);

  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />
      {/* <Test setState={setTest} /> */}
      <div className="content">
        {adminProfile?.isAdmin === true && (
          <div className="Leave_detail_overAll">
            <TodayEmpLeave name={appliedUsers} />
            <TodayEmpWFH name={appliedUsers} />
            <UpcomingLeave list={upcomingLeaves} />
          </div>
        )}
        <button
          className="add_employee"
          data-bs-toggle="modal"
          data-bs-target="#myModal"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          Apply
        </button>
        <div className="modal fade" id="myModal">
          <div className="modal-dialog modal-dialog-centered modal-xs">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title text-center">Apply</h4>
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
                                  const selectedOption = event.target.options[event.target.selectedIndex];
                                  setId(selectedOption.getAttribute("data-id") || "");
                                  if (event.target.value !== "All Employees") {
                                    setSelectedDates([]);
                                  }
                                }}
                              >
                                <option value="">Select a Name</option>
                                <option value="All Employees">All Employees</option>

                                {empProfile
                                  .filter(
                                    (user) => user.profilestatus === "Active"
                                  )
                                  .map((user, index) => (
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
                            {/* always use multiple date selector */}
                              <div>
                                <input
                                  className="form-control mb-2"
                                  type="date"
                                  onChange={(event) => {
                                    const newDate = event.target.value;
                                    if (newDate && !selectedDates.includes(newDate)) {
                                      setSelectedDates([...selectedDates, newDate]);
                                    }
                                  }}
                                />
                                {/* more leve apply dropdown */}
                                <div className="mt-2 border rounded px-2 bg-light" style={{ maxHeight: "140px", overflowY: "auto" }}>
                                  {selectedDates.map((date) => (
                                    <div key={date} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                      <span className="text-dark fw-bold" style={{ fontSize: "14px" }}>{date.split('-').reverse().join('/')}</span>
                                      {/* <span className="text-dark fw-bold" style={{ fontSize: "14px" }}>{date}</span> */}
                                      <i
                                        className="fa fa-times text-danger"
                                        style={{ cursor: "pointer" }}
                                        title="Remove date"
                                        onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                                      ></i>
                                    </div>
                                  ))}
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label className="form-label">Reason Type</label>
                          <div className="apply-reason-leave">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                checked={reason === "Leave"}
                                name="Reason"
                                onChange={() => {
                                  setReason("Leave");
                                  setWorkfromhome();
                                  setAbsencetype();
                                  setPermissionTime();
                                }}
                                id="Leave"
                                value="Leave"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="Leave"
                              >
                                Leave
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                checked={reason === "WFH"}
                                name="Reason"
                                onChange={() => {
                                  setReason("WFH");
                                  setWorkfromhome();
                                  setAbsencetype();
                                  setPermissionTime();
                                }}
                                id="WFH"
                                value="WFH"
                              />
                              <label className="form-check-label" htmlFor="WFH">
                                WFH
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                checked={reason === "Permission"}
                                name="Reason"
                                onChange={() => {
                                  setReason("Permission");
                                  setWorkfromhome();
                                  setAbsencetype();
                                  setPermissionTime();
                                }}
                                id="Permission"
                                value="Permission"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="Permission"
                              >
                                Permission
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      {reason === "Leave" && (
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
                                <option selected="">Select Absence Type</option>
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
                                <option value="unpaid leave">
                                  Unpaid Leave
                                </option>
                                <option value="vacation">Vacation Leave</option>
                                <option value="public holiday">
                                  Public Holiday
                                </option>
                                <option value="out of office">
                                  Out of Office
                                </option>
                                <option value="offset leave">
                                  Offset Leave
                                </option>
                                <option value="half day">Half day Leave</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      {reason === "WFH" && (
                        <div className="row">
                          <div className="mb-3 col-md-12">
                            <div id="Name">
                              <label className="form-label">WFH Time (HH:MM)</label>
                              <input
                                className="form-control"
                                type="text"
                                placeholder="02:00"
                                maxLength="5"
                                onChange={(event) => {
                                  setWorkfromhome(formatTime(event.target.value));
                                }}
                                value={workfromhome}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {reason === "Permission" && (
                        <div className="row">
                          <div className="mb-3 col-md-12">
                            <div id="Name">
                              <label className="form-label">
                                Permission Time (HH:MM)
                                </label>
                              <input
                                className="form-control"
                                type="text"
                                placeholder="02:00"
                                maxLength="5"
                                onChange={(event) => {
                                  setPermissionTime(formatTime(event.target.value));
                                }}
                                value={permissionTime}
                              />
                            </div>
                          </div>
                        </div>
                      )}

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
                  Apply
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
                      <th>Created At</th>
                      <th>
                        Name
                        <i
                          className="fa fa-sort"
                          aria-hidden="true"
                          onClick={() => handleSort("name")}
                        ></i>
                      </th>
                      <th>
                        Apply Date
                        <i
                          className="fa fa-sort"
                          aria-hidden="true"
                          onClick={() => handleSort("date")}
                        ></i>
                      </th>
                      <th>Status</th>
                      <th>Absence Type</th>
                      <th>Permission</th>
                      <th>WFH</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListOfUsers.length > 0 ? (
                      filteredListOfUsers.map((user, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td>{user.name}</td>

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
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td className="text-warning">{user.status}</td>

                            <td>{user.absencetype ? user.absencetype : "-"}</td>
                            <td>
                              {user.permissionTime ? user.permissionTime : "-"}
                            </td>
                            <td>
                              {user.workFromHome ? user.workFromHome : "-"}
                            </td>
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
                      <tr>
                        <td colSpan="8" className="text-center">
                          <img
                            src="https://res.cloudinary.com/dmkttselw/image/upload/v1689268120/profile/Nodata_czp0rb.png"
                            alt="nodata"
                            className="img-fluid nofound"
                          />
                        </td>
                      </tr>
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
                        setSelectedUserName(event.target.value);
                      }}
                      value={selectedUserName}
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
