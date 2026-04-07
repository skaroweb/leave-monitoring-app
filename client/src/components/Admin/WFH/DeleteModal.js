/* eslint-disable */
import { leaveAPI } from "../../../api/index";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteModal = ({ id, setIsLoading }) => {
  const serverURL = process.env.REACT_APP_SERVER_URL;

  const deleteRecords = () => {
    leaveAPI
      .delete(id._id)
      .then((res) => {
        setIsLoading(true);
        toast.info("Leave delete successfully");
      })
      .catch((err) => console.log(err, "it has an error"));
  };

  return (
    <>
      <div className="modal fade" id="myModal2">
        <div className="modal-dialog modal-dialog-centered modal-confirm">
          <div className="modal-content">
            <div className="modal-header ">
              <h4 className="modal-title w-100">Are you sure?</h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-hidden="true"
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Do you really want to delete these records? This process cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={deleteRecords}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DeleteModal;

