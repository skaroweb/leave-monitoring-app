import "./EmpReport.css";
const EmpReport = (props) => {
  return (
    <div className="col-md-6">
      <div className="main-leave">
        <div className="sub-leave">
          <div>Name</div>
          <div>No. of WFH Days</div>
        </div>
        {Object.entries(props.leaveCountName).map(
          ([id, { days, hours, minutes, name }]) => (
            <div className="sub-leave" key={id}>
              <div>{name}</div>
              <div>
                {days > 0 && (
                  <span>
                    <strong className="strongdays">{days}</strong> days{" "}
                  </span>
                )}
                {hours > 0 && (
                  <span>
                    <strong>{hours}</strong> hours{" "}
                  </span>
                )}
                {minutes > 0 && <span>{minutes} minutes</span>}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
export default EmpReport;
