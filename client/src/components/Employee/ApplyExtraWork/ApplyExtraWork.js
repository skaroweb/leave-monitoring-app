import React, { useState, useEffect } from 'react';
import Header from '../../Common/Header';
import SubNav from '../../Common/Helper/SubNav';
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ApplyExtraWork.css";
import { extraWorkAPI } from "../../../api/index";
import "../../Admin/OverallReport/index.css";
import ReactPaginate from "react-paginate";
import styles from "../../Admin/WFH/DataTable.module.css";
import { Modal } from 'antd';

function ApplyExtraWork() {
    const adminProfile = useSelector((state) => state.adminProfile);

    // Function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year} -${month} -${day} `;
    };

    const [name, setName] = useState("");
    const [applyDate, setApplyDate] = useState(getTodayDate());
    const [extraWorkTime, setExtraWorkTime] = useState(" ");
    const [description, setDescription] = useState("");

    const [requests, setRequests] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const PER_PAGE = 10;
    const offset = currentPage * PER_PAGE;

    useEffect(() => {
        if (adminProfile) {
            setName(adminProfile.name || "");
            fetchMyRequests();
        }
    }, [adminProfile]);

    const fetchMyRequests = async () => {
        try {
            const res = await extraWorkAPI.getAll();
            // Filter only the logged in user's requests
            const myRequests = res.data.filter(item => item.currentuserid === adminProfile?._id);
            setRequests(myRequests);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!extraWorkTime) {
            toast.warn("Please enter extra work time");
            return;
        }

        if (!description) {
            toast.warn("Please enter description/reason");
            return;
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(extraWorkTime)) {
            toast.error("Please enter time in HH:MM format");
            return;
        }

        try {
            await extraWorkAPI.create({
                name: name,
                applydate: applyDate,
                extraWorkTime: extraWorkTime,
                description: description,
                currentuserid: adminProfile?._id,
            });
            toast.success("Extra work applied successfully!");

            // Reset form
            setExtraWorkTime("00:00");
            setDescription("");
            setApplyDate(getTodayDate());

            // Close Modal & refresh data
            setIsModalVisible(false);
            fetchMyRequests();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong.");
        }
    };

    const handlePageClick = ({ selected: selectedPage }) => {
        setCurrentPage(selectedPage);
    };

    const pageCount = Math.ceil(requests.length / PER_PAGE);

    const formatTime = (value) => {
        let val = value.replace(/\D/g, "");
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) {
            return val.slice(0, 2) + ":" + val.slice(2);
        }
        return val;
    };

    const handleTimeChange = (e) => {
        setExtraWorkTime(formatTime(e.target.value));
    };

    return (
        <>
            <div className="sidebar">{adminProfile && <Header />}</div>
            <SubNav />
            <div className="content">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">My Extra Work Requests</h4>
                    <button
                        className="btn btn-dark"
                        onClick={() => setIsModalVisible(true)}
                    >
                        + Apply Extra Work
                    </button>
                </div>

                <div className="overall">
                    <div style={{ overflowX: "auto" }}>
                        <table className="user-table align-items-center table table-hover">
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>HOURS</th>
                                    <th>DESCRIPTION</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length > 0 ? (
                                    requests.slice(offset, offset + PER_PAGE).map((item) => (
                                        <tr key={item._id}>
                                            <td>{new Date(item.applydate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                            <td>{item.extraWorkTime}</td>
                                            <td>{item.description || "-"}</td>
                                            <td className={`${item.status === 'reject' ? 'text-danger' :
                                                    item.status === 'approve' ? 'text-success' : 'text-warning'
                                                } `} style={{ textTransform: 'capitalize' }}>
                                                {item.status}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            No extra work requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.length > PER_PAGE && (
                        <div className="d-flex justify-content-between align-items-center pag_head mt-3">
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
                                forcePage={currentPage}
                            />
                        </div>
                    )}
                </div>

                {/* Ant Design Modal for Application Form */}
                <Modal
                    title="Apply Extra Work"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    destroyOnClose
                >
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: 500 }}>Employee Name</label>
                            <input type="text" className="form-control" value={name} disabled />
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: 500 }}>Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={applyDate}
                                onChange={(e) => setApplyDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label" style={{ fontWeight: 500 }}>Number of Hours (HH:MM)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="02:00"
                                maxLength="5"
                                value={extraWorkTime}
                                onChange={handleTimeChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label" style={{ fontWeight: 500 }}>Description/Reason</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="E.g., Working on weekend production issue"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="text-end">
                            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsModalVisible(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-dark">
                                Submit Application
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>
            <ToastContainer position="top-right" autoClose={2000} theme="dark" />
        </>
    );
}
export default ApplyExtraWork;