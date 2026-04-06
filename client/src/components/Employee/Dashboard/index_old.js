import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import "./index.css";
import { leaveAPI } from "../../../api/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../Common/Header";
import SubNav from "../../Common/Helper/SubNav";
import { useSelector } from "react-redux";

const Main = () => {
  const [listOfUsers, setListOfUsers] = useState([]);
  const [applydate, setapplyDate] = useState([]);
  const [absencetype, setAbsencetype] = useState();

  // const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [showForm, setShowForm] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, ascending: true });

  const adminProfile = useSelector((state) => state.adminProfile);

  // if (adminProfile?.isAdmin === false) {
  //   console.log("success");
  // }
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

  const createUser = () => {
    leaveAPI
      .create({
        name: adminProfile?.name,
        absencetype: absencetype,
        applydate: applydate,
        currentuserid: adminProfile._id,
      })
      .then((response) => {
        setIsLoading(true);
        setAbsencetype("");
        setapplyDate(getTodayDate());
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

  useEffect(() => {
    leaveAPI
      .getAll()
      .then((response) => {
        setIsLoading(false);
        let PendingUser = response.data.filter(function (obj) {
          return obj.status === "pending";
        });
        setListOfUsers(PendingUser.reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  }, [isLoading]);

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

  // const showFormClick = () => {
  //   setShowForm(!showForm);
  // };

  const clear = () => {
    setAbsencetype("");
    setapplyDate(getTodayDate());
  };
  console.log(applydate);
  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />

      <div className="content">
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

                            <input
                              className="form-control"
                              type="text"
                              value={adminProfile?.name}
                              disabled
                            />
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
                              <option selected="">Select Absence Type</option>
                              <option value="conference">Conference</option>
                              <option value="parental">Parental Leave</option>
                              <option value="maternity">Maternity Leave</option>
                              <option value="paternity">Paternity Leave</option>
                              <option value="bereavement">
                                Bereavement Leave
                              </option>
                              <option value="emergency">Emergency Leave</option>
                              <option value="rest">Rest Day</option>
                              <option value="sick">Sick Leave</option>
                              <option value="trip">Business Trip</option>
                              <option value="paid">Paid Leave</option>
                              <option value="unpaid">Unpaid Leave</option>
                              <option value="vacation">Vacation Leave</option>
                              <option value="holiday">Public Holiday</option>
                              <option value="out">Out of Office</option>
                              <option value="offset">Offset Leave</option>
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
              <div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Created At</th>
                      <th>Name</th>
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listOfUsers
                      .filter((obj) => obj.currentuserid === adminProfile?._id)
                      .map((user, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              {new Date(user.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  second: "numeric",
                                }
                              )}
                            </td>
                            <td>{user.name}</td>

                            <td>
                              {new Date(user.applydate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td
                              className={`${user.status === "pending" ? "text-warning" : ""
                                } ${user.status === "approve" ? "text-success" : ""
                                } ${user.status === "reject" ? "text-danger" : ""
                                }`}
                            >
                              {user.status}
                            </td>
                            <td>{user.absencetype}</td>
                            <td>
                              {user.status === "pending" && (
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
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
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
            {/* {error && <div>{error}</div>} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
