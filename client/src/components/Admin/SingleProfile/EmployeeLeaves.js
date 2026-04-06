import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { employeeAPI, leaveAPI } from "../../../api/index";
import SubNav from "../../Common/Helper/SubNav";
import Header from "../../Common/Header";
import ReactPaginate from "react-paginate";
import styles from "../OverallReport/DataTable.module.css";
import { useSelector } from "react-redux";
function EmpLeaves() {
  console.log("currentPage");

  const [report, setReport] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); //Pagination
  const [filteredList, setFilteredList] = useState(report);
  const [empProfile, setEmpProfile] = useState([]);

  // Selected Month filter
  const [selectedMonth, setSelectedMonth] = useState("");
  // Selected Year filter
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedReason, setSelectedReason] = useState("");

  //const [countLeave, setCountLeave] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, ascending: true });
  const [selectedDate, setSelectedDate] = useState({
    fromdate: "",
    todate: "",
  });
  const adminProfile = useSelector((state) => state.adminProfile);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  const location = useLocation();

  useEffect(() => {
    employeeAPI
      .getAll()
      .then((res) => {
        setEmpProfile(res.data);
      })
      .catch((err) => console.log(err, "it has an error"));
  }, []);

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

  useEffect(() => {
    leaveAPI
      .getAll()
      .then((response) => {
        let filteredArray = response.data.filter(function (obj) {
          return obj.status !== "pending";
        });
        let filteredArray2 = filteredArray.filter(function (obj) {
          return obj.currentuserid === location.state.user._id;
        });

        setReport(filteredArray2.reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  }, [location.state.user._id]);

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

  const filterByReason = (filteredData) => {
    // Avoid filter for empty string or undefined data
    if (!selectedReason || !Array.isArray(filteredData)) {
      return filteredData;
    }

    const filteredLeaves = filteredData.filter((leave) => {
      // Check if the leave object matches the selected reason
      if (selectedReason === "absencetype") {
        return leave.reason === "Leave";
      }
      if (selectedReason === "workFromHome") {
        return leave.reason === "WFH";
      }
      if (selectedReason === "permissionTime") {
        return leave.reason === "Permission";
      }
      return true;
    });

    // console.log(filteredLeaves); // Log the filtered leaves array for debugging purposes

    return filteredLeaves;
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

  // Toggle seletedMonth state
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value); // Update selectedReason state with the selected value from the dropdown
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setSelectedDate({
      ...selectedDate,
      [name]: value,
    });
  };

  // Toggle seletedYear state
  const handleYearChange = (event) => {
    const inputYear = Number(event.target.value);

    if (inputYear === selectedYear) {
      setSelectedYear("");
    } else {
      setSelectedYear(inputYear);
    }
  };

  const DeselectAll = (event) => {
    //  console.log(currentPage);
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth("");
    setSelectedStatus("");
    setSelectedReason("");
    setCurrentPage(0);
    setSelectedDate({
      fromdate: "",
      todate: "",
    });
  };

  useEffect(() => {
    setCurrentPage(0);
    var filteredData = filterByYear(report);
    filteredData = filterByMonth(filteredData);
    filteredData = filterByDate(filteredData);
    filteredData = filterByStatus(filteredData);
    filteredData = filterByReason(filteredData);
    setFilteredList(filteredData);
  }, [
    selectedYear,
    selectedMonth,
    selectedDate,
    selectedStatus,
    selectedReason,
    report,
  ]);

  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // const year = new Date().getFullYear();
  // const years = Array.from(new Array(20), (val, index) => index + year);

  const uniqueYears = new Set();
  report.forEach((data) => {
    const applyDate = new Date(data.applydate);
    const year = applyDate.getFullYear();
    uniqueYears.add(year);
  });

  const arrayOfUniqueYears = Array.from(uniqueYears).sort((a, b) => a - b);

  let withoutSat = filteredList.filter(function (obj) {
    return obj.absencetype === "half day";
  });

  const result3 = filteredList.reduce((acc, cur) => {
    const { currentuserid, absencetype, status, reason, permissionTime } = cur;

    if (status === "approve") {
      // Initialize leave duration in days, hours, and minutes
      let leaveDays = 0;
      let leaveHours = 0;
      let leaveMinutes = 0;

      // Calculate leave duration in days, hours, and minutes based on absence type
      if (absencetype === "half day") {
        leaveHours = 4;
      } else if (absencetype !== "half day" && reason !== "Permission") {
        leaveDays = 1;
      }

      // If permission time exists, parse and calculate leave hours and minutes
      if (reason === "Permission" && permissionTime) {
        // Parse permission time
        const [hoursStr, minutesStr] = permissionTime.split(":");
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

  return (
    <>
      <div className="sidebar">{adminProfile && <Header />}</div>
      <SubNav />
      <div className="content">
        <h4>Employee Leave List</h4>
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
            <div className="filter-reason">
              <label>Filter by reason :</label>
              <select
                className="fmxw-200 d-md-inline form-select"
                value={selectedReason}
                onChange={handleReasonChange}
              >
                <option value="">All</option>
                <option value="absencetype">Leave</option>
                <option value="workFromHome">WFH</option>
                <option value="permissionTime">Permission</option>
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
            <div className="filter-month">
              <label>Filter by Month :</label>
              <select
                className="fmxw-200 d-md-inline form-select"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                <option value="">All</option>
                {monthNames.map((name, index) => (
                  <option key={index} value={name}>
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
            <button className="btn btn-dark mt-3 test" onClick={DeselectAll}>
              Deselect All
            </button>
          </div>

          <table className="user-table align-items-center table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>
                  Apply Date
                  <i
                    className="fa fa-sort"
                    aria-hidden="true"
                    onClick={() => handleSort("date")}
                  ></i>
                </th>

                <th>Absence Type</th>
                <th>Permission</th>
                <th>WFH</th>
                <th>Status</th>
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

                    <td>{item.absencetype ? item.absencetype : "-"}</td>
                    <td>{item.permissionTime ? item.permissionTime : "-"}</td>
                    <td>{item.workFromHome ? item.workFromHome : "-"}</td>
                    <td
                      className={`${item.status === "reject" ? "text-danger" : ""
                        } ${item.status === "approve" ? "text-success" : ""}`}
                    >
                      {item.status === "approve" ? "approved" : item.status}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
            <div className="total_leave">
              Total result count: <span>{FilteredDays}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default EmpLeaves;
