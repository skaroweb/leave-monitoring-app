import React, { useEffect, useState } from 'react';
import Header from "../../Common/Header";
import SubNav from "../../Common/Helper/SubNav";
import { useSelector } from "react-redux";
import "../OverallReport/index.css";
import { extraWorkAPI, employeeAPI } from "../../../api/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import styles from "../WFH/DataTable.module.css";
import BalanceSheet from "./BalanceSheet";

function ExtraWorkStatus() {
    const adminProfile = useSelector((state) => state.adminProfile);
    const [extraWorkList, setExtraWorkList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [empProfile, setEmpProfile] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("requests");

    // Filters
    const [selectedName, setselectedName] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedDate, setSelectedDate] = useState({ fromdate: "", todate: "" });

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const PER_PAGE = 10;
    const offset = currentPage * PER_PAGE;

    useEffect(() => {
        employeeAPI.getAll().then((res) => setEmpProfile(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        fetchData();
    }, [isLoading]);

    const fetchData = async () => {
        try {
            const res = await extraWorkAPI.getAll();
            setExtraWorkList(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Derived unique years
    const uniqueYears = Array.from(new Set(extraWorkList.map(data => new Date(data.applydate).getFullYear()))).sort((a, b) => a - b);

    useEffect(() => {
        setCurrentPage(0);
        let result = extraWorkList;

        if (selectedYear) {
            result = result.filter(item => new Date(item.applydate).getFullYear() === selectedYear);
        }
        if (selectedStatus) {
            result = result.filter(item => item.status === selectedStatus);
        }
        if (selectedName) {
            result = result.filter(item => item.currentuserid === selectedName);
        }
        if (selectedDate.fromdate && selectedDate.todate) {
            result = result.filter(item => {
                const itemDate = new Date(item.applydate);
                const itemDateStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;
                return itemDateStr >= selectedDate.fromdate && itemDateStr <= selectedDate.todate;
            });
        }
        setFilteredList(result);
    }, [selectedYear, selectedStatus, selectedName, selectedDate, extraWorkList]);

    const handleAction = async (id, status) => {
        try {
            await extraWorkAPI.update(id, { status });
            toast.success(`Request ${status} successfully`);
            setIsLoading(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Action failed");
        }
    };

    const handlePageClick = ({ selected: selectedPage }) => {
        setCurrentPage(selectedPage);
    };

    const DeselectAll = () => {
        setCurrentPage(0);
        setselectedName("");
        setSelectedYear(new Date().getFullYear());
        setSelectedStatus("");
        setSelectedDate({ fromdate: "", todate: "" });
    };

    return (
        <>
            <div className="sidebar">{adminProfile && <Header />}</div>
            <SubNav />
            <div className="content">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Extra Work Status</h4>
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className={`btn ${activeTab === "requests" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setActiveTab("requests")}
                        >
                            Requests
                        </button>
                        <button
                            type="button"
                            className={`btn ${activeTab === "balances" ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setActiveTab("balances")}
                        >
                            Real-Time Balance Sheet
                        </button>
                    </div>
                </div>

                {activeTab === "requests" ? (
                    <div className="overall">
                        {/* Filter Section */}
                        <div className="overall-filter align-items-end">
                            <div className="filter-status">
                                <label>Filter by status :</label>
                                <select className="fmxw-200 d-md-inline form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                    <option value="">All</option>
                                    <option value="approve">Approved</option>
                                    <option value="reject">Reject</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div className="filter-year">
                                <label>Filter by year :</label>
                                <select className="fmxw-200 d-md-inline form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : "")}>
                                    <option value="">All</option>
                                    {uniqueYears.map((year, idx) => (
                                        <option key={idx} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-name">
                                <label>Filter by name :</label>
                                <select className="fmxw-200 d-md-inline form-select" value={selectedName} onChange={(e) => setselectedName(e.target.value)}>
                                    <option value="">All</option>
                                    {empProfile.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-from-date">
                                <label>Filter by from date:</label>
                                <input className="form-control" type="date" value={selectedDate.fromdate} name="fromdate" onChange={(e) => setSelectedDate({ ...selectedDate, fromdate: e.target.value })} />
                            </div>
                            <div className="filter-to-date">
                                <label>Filter by to date:</label>
                                <input className="form-control" type="date" value={selectedDate.todate} name="todate" onChange={(e) => setSelectedDate({ ...selectedDate, todate: e.target.value })} />
                            </div>
                            <button className="btn btn-dark pb-2" style={{ height: "40px" }} onClick={DeselectAll}>
                                Deselect All
                            </button>
                        </div>

                        {/* Table Section */}
                        <div style={{ overflowX: "auto" }}>
                            <table className="user-table align-items-center table table-hover">
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>DATE</th>
                                        <th>EXTRA WORK TIME</th>
                                        <th>DESCRIPTION</th>
                                        <th>STATUS</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length > 0 ? (
                                        filteredList.slice(offset, offset + PER_PAGE).map((item) => (
                                            <tr key={item._id}>
                                                <td>{empProfile.find(emp => emp._id === item.currentuserid)?.name || item.name}</td>
                                                <td>{new Date(item.applydate).toLocaleDateString()}</td>
                                                <td>{item.extraWorkTime || "-"}</td>
                                                <td>{item.description || "-"}</td>
                                                <td className={`${item.status === 'reject' ? 'text-danger' :
                                                    item.status === 'approve' ? 'text-success' : 'text-warning'
                                                    }`} style={{ textTransform: 'capitalize' }}>
                                                    {item.status}
                                                </td>
                                                <td>
                                                    {item.status === 'pending' ? (
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="badge bg-dark border-0 p-2 text-white"
                                                                style={{ cursor: "pointer", border: "1px solid #000" }}
                                                                onClick={() => handleAction(item._id, 'approve')}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="badge bg-danger border-0 p-2 text-white"
                                                                style={{ cursor: "pointer", border: "1px solid #dc3545" }}
                                                                onClick={() => handleAction(item._id, 'reject')}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                No extra work requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center pag_head mt-3">
                            {filteredList.length > PER_PAGE && (
                                <ReactPaginate
                                    previousLabel={"Previous"}
                                    nextLabel={"Next"}
                                    pageCount={Math.ceil(filteredList.length / PER_PAGE)}
                                    onPageChange={handlePageClick}
                                    containerClassName={styles.pagination_ul}
                                    previousLinkClassName={styles.paginationLink}
                                    nextLinkClassName={styles.paginationLink}
                                    disabledClassName={styles.paginationDisabled}
                                    activeClassName={styles.paginationActive}
                                    forcePage={currentPage}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <BalanceSheet />
                )}

            </div>
            <ToastContainer position="top-right" autoClose={2000} theme="dark" />
        </>
    );
}

export default ExtraWorkStatus;