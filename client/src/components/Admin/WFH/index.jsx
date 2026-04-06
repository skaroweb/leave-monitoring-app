import { useEffect, useState } from "react";
import { employeeAPI, leaveAPI } from "../../../api/index";
import Header from "../../Common/Header";
import SubNav from "../../Common/Helper/SubNav";
import EmpReport from "./EmpReport";
import "./index.css";
import ReactPaginate from "react-paginate";
import styles from "./DataTable.module.css";
import ExcelReport from "./ExcelReport";
import EmpLeaveChart from "./EmpLeaveChart";
import DeleteModal from "./DeleteModal";
import { useSelector } from "react-redux";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateModal from "./UpdateModal";

function WFH() {
  const adminProfile = useSelector((state) => state.adminProfile);
  // const empProfile = useSelector((state) => state.empProfile);
  const [empId, setEmpId] = useState([]);

  const [empProfile, setEmpProfile] = useState([]);
  const [report, setReport] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); //Pagination

  const [leaveCountName, setLeaveCountName] = useState([]);
  const [filteredList, setFilteredList] = useState(report);

  // Selected User name filter
  const [selectedName, setselectedName] = useState("");
  // Selected Month filter
  const [selectedMonth, setSelectedMonth] = useState("");
  // Selected Year filter
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedDate, setSelectedDate] = useState({
    fromdate: "",
    todate: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, ascending: true });
  const [hide, setHide] = useState(false);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  // Pagination
  const PER_PAGE = 10;
  const pageCount = Math.ceil(filteredList.length / PER_PAGE);
  function handlePageClick({ selected: selectedPage }) {
    setCurrentPage(selectedPage);
  }
  const offset = currentPage * PER_PAGE;

  // Function to handle sorting when the button is clicked
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.ascending) {
      direction = "descending";
    }
    const sorted = [...filteredList].sort((a, b) => {
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

    setFilteredList(sorted);
    setSortConfig({ key, ascending: direction === "ascending" });
  };

  /*******  For Employee leave get by the id and compare into Emp Profile name ********/

  useEffect(() => {
    employeeAPI
      .getAll()
      .then((res) => {
        setEmpProfile(res.data);
      })
      .catch((err) => console.log(err, "it has an error"));
  }, []);

  useEffect(() => {
    leaveAPI
      .getAll()
      .then((response) => {
        setIsLoading(false);
        let filteredArray = response.data.filter(function (obj) {
          // Check if the status is not "pending" and the applydate is in the current year
          return obj.status !== "pending" && obj.reason === "WFH";
        });

        setReport(
          //  filteredArray.reverse().sort((a, b) => a.name.localeCompare(b.name))
          filteredArray.reverse()
        );

        let filteredResult = filteredArray;

        if (selectedYear !== 0) {
          filteredResult = filteredResult.filter(
            (obj) => new Date(obj.applydate).getFullYear() === selectedYear
          );
        }

        const result = filteredResult.reduce((acc, cur) => {
          const { currentuserid, status, reason, workFromHome } = cur;

          if (status === "approve") {
            // Initialize leave duration in days, hours, and minutes
            let leaveDays = 0;
            let leaveHours = 0;
            let leaveMinutes = 0;

            // If permission time exists, parse and calculate leave hours and minutes
            if (reason === "WFH" && workFromHome) {
              // Parse permission time
              const [hoursStr, minutesStr] = workFromHome.split(":");
              const hours = parseInt(hoursStr);
              const minutes = parseInt(minutesStr);

              // Add parsed hours and minutes to leave duration
              leaveHours += hours;
              leaveMinutes += minutes;
            }

            // Convert excess minutes to hours
            if (leaveMinutes >= 60) {
              const additionalHours = Math.floor(leaveMinutes / 60);
              leaveHours += additionalHours;
              leaveMinutes %= 60; // Update leave minutes with remainder
            }

            // Convert excess hours to days
            if (leaveHours >= 8) {
              const additionalDays = Math.floor(leaveHours / 8);
              leaveDays += additionalDays;
              leaveHours %= 8; // Update leave hours with remainder
            }

            // Update accumulator
            if (currentuserid in acc) {
              acc[currentuserid].days += leaveDays;
              acc[currentuserid].hours += leaveHours;
              acc[currentuserid].minutes += leaveMinutes;
            } else {
              acc[currentuserid] = {
                days: leaveDays,
                hours: leaveHours,
                minutes: leaveMinutes,
              };
            }
          }

          return acc;
        }, {});

        // Adjust the total hours and minutes if needed
        for (const userId in result) {
          let { hours, minutes } = result[userId];

          // Convert excess minutes to hours
          if (minutes >= 60) {
            const additionalHours = Math.floor(minutes / 60);
            hours += additionalHours;
            minutes %= 60; // Update leave minutes with remainder
          }

          // Convert excess hours to days
          if (hours >= 8) {
            const additionalDays = Math.floor(hours / 8);
            result[userId].days += additionalDays;
            hours %= 8; // Update leave hours with remainder
          }

          result[userId] = { ...result[userId], hours, minutes };
        }
        const idToNameMap = {};
        console.log(result);

        for (const id in result) {
          const { days, hours, minutes } = result[id];
          const profile = empProfile.find((profile) => profile._id === id);

          // let withoutSatReject = filteredArray.filter(function (obj) {
          //   return obj.absencetype === "half day" && obj.status !== "reject";
          // });
          // console.log(withoutSatReject);
          if (profile) {
            idToNameMap[id] = {
              days,
              hours,
              minutes,
              name: profile.name,
            };
          }
        }

        setLeaveCountName(idToNameMap);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [empProfile, isLoading, selectedYear]);

  /*******  For Employee leave get by the id and compare into Emp Profile name ********/

  const filterByName = (filteredData) => {
    setCurrentPage(0);
    // Avoid filter for empty string
    if (!selectedName) {
      return filteredData;
    }

    const filteredCars = filteredData.filter(
      (car) => car.currentuserid === selectedName
      //car.name.split(" ").indexOf(selectedName) !== -1
    );
    return filteredCars;
  };

  const filterByStatus = (filteredData) => {
    // Avoid filter for empty string
    if (!selectedStatus) {
      return filteredData;
    }

    const filteredCars = filteredData.filter(
      (car) => car.status.split(" ").indexOf(selectedStatus) !== -1
    );
    return filteredCars;
  };

  const filterByDate = (filteredData) => {
    if (selectedDate.fromdate === "" || selectedDate.todate === "") {
      return filteredData;
    }

    const filteredCars = filteredData
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(
        (car) =>
          `${new Date(car.applydate).getFullYear()}-${(
            new Date(car.applydate).getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${new Date(car.applydate)
              .getDate()
              .toString()
              .padStart(2, "0")}` >= selectedDate.fromdate &&
          `${new Date(car.applydate).getFullYear()}-${(
            new Date(car.applydate).getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${new Date(car.applydate)
              .getDate()
              .toString()
              .padStart(2, "0")}` <= selectedDate.todate
      );

    return filteredCars;
  };

  const filterByYear = (filteredData) => {
    // Avoid filter for null value
    if (!selectedYear) {
      return filteredData;
    }

    const filteredCars = filteredData.filter(
      (car) => new Date(car.applydate).getFullYear() === selectedYear
    );
    //console.log(filteredCars);
    return filteredCars;
  };

  const filterByMonth = (filteredData) => {
    // Avoid filter for null value
    if (!selectedMonth) {
      return filteredData;
    }

    const filteredCars = filteredData.filter(
      (car) =>
        new Date(car.applydate)
          .toLocaleString("default", {
            month: "long",
          })
          .split(" ")
          .indexOf(selectedMonth) !== -1
    );
    return filteredCars;
  };

  // Update seletedBrand state
  const handleBrandChange = (event) => {
    setHide(true);
    setselectedName(event.target.value);
  };

  // Toggle seletedMonth state
  // const handleMonthChange = (event) => {
  //   setSelectedMonth(event.target.value);
  // };

  // Toggle seletedMonth state
  const handleStatusChange = (event) => {
    setHide(true);
    setSelectedStatus(event.target.value);
  };

  //Toggle seletedYear state
  const handleYearChange = (event) => {
    const inputYear = Number(event.target.value);

    if (inputYear === selectedYear) {
      setSelectedYear("");
    } else {
      setSelectedYear(inputYear);
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setSelectedDate({
      ...selectedDate,
      [name]: value,
    });
    setHide(true);
  };
  // console.log(selectedDate);
  const DeselectAll = (event) => {
    setCurrentPage(0);
    setselectedName("");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth("");
    setSelectedStatus("");
    setSelectedDate({
      fromdate: "",
      todate: "",
    });
    setHide(false);
  };

  useEffect(() => {
    setCurrentPage(0);
    var filteredData = filterByName(report);
    filteredData = filterByYear(filteredData);
    filteredData = filterByMonth(filteredData);
    filteredData = filterByDate(filteredData);
    filteredData = filterByStatus(filteredData);
    setFilteredList(filteredData);
  }, [
    selectedName,
    selectedYear,
    selectedMonth,
    selectedDate,
    selectedStatus,
    report,
  ]);

  let withoutSat = filteredList.filter(function (obj) {
    return obj.absencetype === "half day";
  });
  let withoutSatReject = filteredList.filter(function (obj) {
    return obj.absencetype === "half day" && obj.status !== "reject";
  });

  const uniqueYears = new Set();

  report.forEach((data) => {
    const applyDate = new Date(data.applydate);
    const year = applyDate.getFullYear();
    uniqueYears.add(year);
  });

  const arrayOfUniqueYears = Array.from(uniqueYears).sort((a, b) => a - b);

  let totalCount = 0;

  for (const key in leaveCountName) {
    if (leaveCountName.hasOwnProperty(key)) {
      totalCount += leaveCountName[key].days;
    }
  }

  const result3 = filteredList.reduce((acc, cur) => {
    const { currentuserid, status, reason, workFromHome } = cur;

    if (status === "approve") {
      // Initialize leave duration in days, hours, and minutes
      let leaveDays = 0;
      let leaveHours = 0;
      let leaveMinutes = 0;

      // If permission time exists, parse and calculate leave hours and minutes
      if (reason === "WFH" && workFromHome) {
        // Parse permission time
        const [hoursStr, minutesStr] = workFromHome.split(":");
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);

        // Add parsed hours and minutes to leave duration
        leaveHours += hours;
        leaveMinutes += minutes;
      }

      // Convert excess minutes to hours
      if (leaveMinutes >= 60) {
        const additionalHours = Math.floor(leaveMinutes / 60);
        leaveHours += additionalHours;
        leaveMinutes %= 60; // Update leave minutes with remainder
      }

      // Convert excess hours to days
      if (leaveHours >= 8) {
        const additionalDays = Math.floor(leaveHours / 8);
        leaveDays += additionalDays;
        leaveHours %= 8; // Update leave hours with remainder
      }

      // Update accumulator
      if (currentuserid in acc) {
        acc[currentuserid].days += leaveDays;
        acc[currentuserid].hours += leaveHours;
        acc[currentuserid].minutes += leaveMinutes;
      } else {
        acc[currentuserid] = {
          days: leaveDays,
          hours: leaveHours,
          minutes: leaveMinutes,
        };
      }
    }

    return acc;
  }, {});

  // Adjust the total hours and minutes if needed
  for (const userId in result3) {
    let { hours, minutes } = result3[userId];

    // Convert excess minutes to hours
    if (minutes >= 60) {
      const additionalHours = Math.floor(minutes / 60);
      hours += additionalHours;
      minutes %= 60; // Update leave minutes with remainder
    }

    // Convert excess hours to days
    if (hours >= 8) {
      const additionalDays = Math.floor(hours / 8);
      result3[userId].days += additionalDays;
      hours %= 8; // Update leave hours with remainder
    }

    result3[userId] = { ...result3[userId], hours, minutes };
  }

  // console.log(result2);

  const idToNameMap = {};

  for (const id in result3) {
    const { days, hours, minutes } = result3[id];
    const profile = empProfile.find((profile) => profile._id === id);

    if (profile) {
      idToNameMap[id] = {
        days,
        hours,
        minutes,
        name: profile.name,
      };
    }
  }

  // Initialize total days
  let FilteredDays = 0;

  // Iterate through the result3 object to calculate total days
  for (const userId in result3) {
    FilteredDays += result3[userId].days;
  }

  // console.log(FilteredDays);

  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />
      <div className="content">
        <h4>Employee WFH List</h4>
        <ExcelReport items={filteredList} />
        <div className="overall">
          <div className="overall-filter">
            <div className="filter-status">
              <label>Filter by status :</label>
              <select
                className="fmxw-200 d-md-inline form-select"
                value={selectedStatus}
                onChange={handleStatusChange}
              >
                <option value="">All</option>
                <option value="approve">Approved</option>
                <option value="reject">Reject</option>
              </select>
            </div>
            <div className="filter-year">
              <label>Filter by year :</label>
              <select
                className="fmxw-200 d-md-inline form-select"
                value={selectedYear}
                onChange={handleYearChange}
              >
                <option value="">All</option>
                {arrayOfUniqueYears.map((key, index) => (
                  <option key={index} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-name">
              <label>Filter by name :</label>
              <select
                className="fmxw-200 d-md-inline form-select"
                name="name"
                value={selectedName}
                onChange={handleBrandChange}
              >
                <option value="">All</option>

                {Object.entries(leaveCountName).map(([id, { count, name }]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-from-date">
              <label>Filter by from date:</label>
              <input
                className="form-control"
                type="date"
                value={selectedDate.fromdate}
                name="fromdate"
                onChange={handleDateChange}
              />
            </div>

            <div className="filter-to-date">
              <label>Filter by to date:</label>
              <input
                className="form-control"
                type="date"
                value={selectedDate.todate}
                name="todate"
                onChange={handleDateChange}
              />
            </div>
            <button className="btn btn-dark mt-3" onClick={DeselectAll}>
              Deselect All
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="user-table align-items-center table table-hover ">
              <thead>
                <tr>
                  <th>
                    Name
                    <i
                      className="fa fa-sort"
                      aria-hidden="true"
                      onClick={() => handleSort("name")}
                    ></i>
                  </th>
                  <th>
                    applydate
                    <i
                      className="fa fa-sort"
                      aria-hidden="true"
                      onClick={() => handleSort("date")}
                    ></i>
                  </th>
                  <th>WFH</th>
                  <th>status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList
                  .slice(offset, offset + PER_PAGE)
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>

                      <td>
                        {new Date(item.applydate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td>{item.workFromHome ? item.workFromHome : "-"}</td>
                      <td
                        className={`${item.status === "reject" ? "text-danger" : ""
                          } ${item.status === "approve" ? "text-success" : ""}`}
                      >
                        {item.status === "approve" ? "approved" : item.status}
                      </td>
                      <td>
                        <Dropdown as={ButtonGroup} className="">
                          <Dropdown.Toggle split variant="link">
                            <i
                              className="fa fa-ellipsis-h"
                              aria-hidden="true"
                              style={{ color: "#000" }}
                            ></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              data-bs-toggle="modal"
                              data-bs-target="#myModal2"
                              onClick={() => {
                                setEmpId(item);
                              }}
                            >
                              Delete
                            </Dropdown.Item>
                            <Dropdown.Item
                              data-bs-toggle="modal"
                              data-bs-target="#myModal"
                              onClick={() => {
                                setEmpId(item);
                              }}
                            >
                              Update
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center pag_head">
            {filteredList.length > 10 && (
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={styles.pagination_ul}
                previousLinkClassName={styles.paginationLink}
                nextLinkClassName={styles.paginationLink}
                disabledClassName={styles.paginationDisabled}
                activeClassName={styles.paginationActive}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                forcePage={currentPage} // Set the active page
              />
            )}

            <div className="total_leave_detail">
              {!hide && (
                <>
                  <div className="total_leave">
                    Total Approved WFH : <span>{totalCount}</span>
                  </div>
                </>
              )}
              {hide && (
                <div className="total_leave">
                  Total filtered WFH count: <span>{FilteredDays}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <>
          <h2 className="current_year_leave_info">
            Current Year WFH Information
          </h2>
          <div className="emp_leave_list">
            <EmpLeaveChart leaveCountName={leaveCountName} />
            <EmpReport leaveCountName={leaveCountName} />
          </div>
        </>
      </div>
      <DeleteModal id={empId} setIsLoading={setIsLoading} />
      <UpdateModal id={empId} setIsLoading={setIsLoading} />
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
    </>
  );
}
export default WFH;
