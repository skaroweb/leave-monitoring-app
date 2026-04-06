import { useState, useEffect } from "react";
import "./TodayEmpLeave.css";
import { employeeAPI } from "../../../api/index";

const TodayEmpWFH = (props) => {
  const [array1, setArray1] = useState([]);
  const [array2, setArray2] = useState([]);
  const [matchingNames, setMatchingNames] = useState([]);
  const serverURL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    // Simulated API fetch or data initialization
    const fetchData = async () => {
      // Fetch or set data for array1
      const response1 = await employeeAPI.getAll();
      const data1 = response1.data;

      setArray1(data1);

      setArray2(props.name);
    };

    fetchData();
  }, [props.name]);

  useEffect(() => {
    //Compare arrays and find matching names
    if (array1.length > 0 && array2.length > 0) {
      const matchingNames = array1.filter((item1) =>
        array2.some(
          (item2) => item2.currentuserid === item1._id && item2.reason === "WFH"
        )
      );
      setMatchingNames(matchingNames);
    }
  }, [array1, array2]);

  return (
    <>
      <article className="leaderboard">
        <header>
          <h1 className="leaderboard__title">
            <span className="leaderboard__title--top">Today</span>
            <span className="leaderboard__title--bottom">
              Employees work From Home
            </span>
          </h1>
        </header>

        <main className="leaderboard__profiles">
          {matchingNames.length > 0 ? (
            <>
              {matchingNames.map((employee, index) => (
                <article key={index} className="leaderboard__profile">
                  <img
                    src={employee.uploaded_file}
                    alt={employee.name}
                    className="leaderboard__picture"
                  />
                  <span className="leaderboard__name">{employee.name}</span>
                  <span className="leaderboard__value">Approved</span>
                </article>
              ))}
            </>
          ) : (
            <p>No matching employees found</p>
          )}
        </main>
      </article>
    </>
  );
};
export default TodayEmpWFH;
