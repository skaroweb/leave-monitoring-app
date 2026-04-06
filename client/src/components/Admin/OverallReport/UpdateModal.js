import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { leaveAPI } from "../../../api/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateModal = ({ id, setIsLoading }) => {
  const [applydate, setapplyDate] = useState("");
  const [compensation, setCompensation] = useState(false);
  const adminProfile = useSelector((state) => state.adminProfile);
  const serverURL = process.env.REACT_APP_SERVER_URL;
  // new Date(id.applydate).toISOString().slice(0, 10)
  //console.log(id);
  useEffect(() => {
    if (id && id._id) {
      leaveAPI
        .getById(id._id)
        .then((res) => {
          console.log(res.data);
          setapplyDate(new Date(res.data.applydate).toISOString().slice(0, 10));
          setCompensation(res.data.compensation);
        })
        .catch((err) => console.log(err, "it has an error"));
    }
  }, [id]);

  const updateRecords = () => {
    // console.log(id.currentuserid);
    // setCompensation(id.compensation === true && true);
    // console.log(compensation);
    leaveAPI
      .update(id._id, {
        currentuserid: id.currentuserid,
        applydate: applydate,
        compensation: compensation, // Include compensation in the update payload
      })
      .then((res) => {
        setIsLoading(true);
        toast.info("Leave updated successfully");
      })
      .catch((err) => {
        if (
          err.response &&
          err.response.status >= 400 &&
          err.response.status <= 500
        ) {
          //  setError(error.response.data.message);
          toast.warn(err.response.data.message);
        }
      });
  };
  return (
    <>
      <div className="modal fade" id="myModal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title text-center">Leave date change</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    type="input"
                    disabled
                    value={id.name}
                  //   value={new Date(applydate).toISOString().slice(0, 10)}
                  />
                </div>
                <div className="col-md-6 mt-2 mt-md-0">
                  <input
                    className="form-control"
                    type="date"
                    onChange={(event) => {
                      setapplyDate(event.target.value);
                    }}
                    value={applydate}
                  //   value={new Date(applydate).toISOString().slice(0, 10)}
                  />
                </div>
                <div className="col-md-12 mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="compensation"
                      id="compensation"
                      checked={compensation}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Execute the action only if the checkbox is checked
                          setCompensation(true); // Set compensation state to true
                          // Additional action or logic here if needed
                        } else {
                          setCompensation(false); // Set compensation state to false if the checkbox is unchecked
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="compensation">
                      Compensation
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer justify-content-between">
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
                onClick={updateRecords}
              >
                Update
              </button>
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UpdateModal;
