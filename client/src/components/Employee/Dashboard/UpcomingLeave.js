import { useState, useEffect } from "react";
import "./TodayEmpLeave.css";
import { employeeAPI } from "../../../api/index";

const UpcomingLeave = (props) => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    };

    fetchData();
  }, []);

  return (
    <>
      <article className="leaderboard">
        <header>
          <h1 className="leaderboard__title">
            <span className="leaderboard__title--top">Upcoming</span>
            <span className="leaderboard__title--bottom">Employees Leave</span>
          </h1>
        </header>

        <main className="leaderboard__profiles upcoming">
          {props.list.length > 0 ? (
            <>
              {props.list
                .sort(function (a, b) {
                  return new Date(a.applydate) - new Date(b.applydate);
                })
                .map((employee, index) => {
                  const empRecord = employees.find(emp => emp._id === employee.currentuserid);
                  const imageUrl = empRecord?.uploaded_file || "https://res.cloudinary.com/dmkttselw/image/upload/v1689268120/profile/Nodata_czp0rb.png";
                  return (
                    <article key={index} className="leaderboard__profile">
                      <img
                        src={imageUrl}
                        alt={employee.name}
                        className="leaderboard__picture"
                      />
                      <span className="leaderboard__name">{employee.name}</span>
                      <span className="leaderboard__value">
                        {new Date(employee.applydate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </article>
                  );
                })}
            </>
          ) : (
            <p>No matching employees found</p>
          )}
        </main>
      </article>
    </>
  );
};
export default UpcomingLeave;
