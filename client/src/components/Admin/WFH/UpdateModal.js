/* eslint-disable */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { leaveAPI } from "../../../api/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateModal = ({ id, setIsLoading }) => {
  const [applydate, setapplyDate] = useState("");
  const adminProfile = useSelector((state) => state.adminProfile);
  const serverURL = process.env.REACT_APP_SERVER_URL;
  // new Date(id.applydate).toISOString().slice(0, 10)

  useEffect(() => {
    if (id && id._id) {
      leaveAPI
        .getById(id._id)
        .then((res) => {
          setapplyDate(new Date(res.data.applydate).toISOString().slice(0, 10));
        })
        .catch((err) => console.log(err, "it has an error"));
    }
  }, [id]);

  const updateRecords = () => {
    // console.log(id.currentuserid);
    leaveAPI
      .update(id._id, {
        currentuserid: id.currentuserid,
        applydate: applydate,
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

