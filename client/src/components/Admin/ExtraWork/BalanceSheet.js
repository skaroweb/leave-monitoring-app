import React, { useEffect, useState } from "react";
import { Table, Spin, DatePicker } from "antd";
import { extraWorkAPI } from "../../../api/index";
import dayjs from "dayjs";

const BalanceSheet = ({ empProfile = [], uniqueYears = [], loggedInUserId = null }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedName, setselectedName] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedDate, setSelectedDate] = useState({ fromdate: "", todate: "" });

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                setLoading(true);
                const params = {};
                if (selectedYear) params.year = selectedYear;
                if (loggedInUserId) {
                    params.name = loggedInUserId;
                } else if (selectedName) {
                    params.name = selectedName;
                }
                if (selectedDate.fromdate) params.fromdate = selectedDate.fromdate;
                if (selectedDate.todate) params.todate = selectedDate.todate;
                if (selectedStatus) params.status = selectedStatus;

                const res = await extraWorkAPI.getBalances(params);
                setBalances(res.data);
            } catch (err) {
                console.error("Failed to fetch balances:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [selectedYear, selectedName, selectedDate, selectedStatus, loggedInUserId]);

    const DeselectAll = () => {
        setselectedName("");
        setSelectedYear(new Date().getFullYear());
        setSelectedStatus("");
        setSelectedDate({ fromdate: "", todate: "" });
    };

    const columns = [
        {
            title: "Employee Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Permission Time (Balance)",
            dataIndex: "remainingPermission",
            key: "remainingPermission",
            render: (text) => (
                <span style={{ color: text === "00:00" || text === "0" ? "red" : "inherit", fontWeight: "bold" }}>
                    {text || "00:00"}
                </span>
            ),
        },
        {
            title: "Extra Work Time (Balance)",
            dataIndex: "remainingExtraWork",
            key: "remainingExtraWork",
            render: (text) => (
                <span style={{ color: text === "00:00" || text === "0" ? "red" : (text !== "0" ? "green" : "inherit"), fontWeight: "bold" }}>
                    {text || "00:00"}
                </span>
            ),
        },
    ];

    return (
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", margin: "10px 30px" }}>
            <h5 className="mb-4">Real-Time Balance Sheet</h5>
            
            <div className="overall-filter align-items-end mb-4">
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
                {!loggedInUserId && (
                    <div className="filter-name">
                        <label>Filter by name :</label>
                        <select className="fmxw-200 d-md-inline form-select" value={selectedName} onChange={(e) => setselectedName(e.target.value)}>
                            <option value="">All</option>
                            {empProfile.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="filter-from-date">
                    <label>Filter by from date:</label>
                    <DatePicker 
                        style={{ width: "100%", height: "38px" }}
                        format="DD-MM-YYYY" 
                        value={selectedDate.fromdate ? dayjs(selectedDate.fromdate) : null} 
                        onChange={(date) => setSelectedDate({ ...selectedDate, fromdate: date ? date.format("YYYY-MM-DD") : "" })} 
                        placeholder="DD-MM-YYYY" 
                    />
                </div>
                <div className="filter-to-date">
                    <label>Filter by to date:</label>
                    <DatePicker 
                        style={{ width: "100%", height: "38px" }}
                        format="DD-MM-YYYY" 
                        value={selectedDate.todate ? dayjs(selectedDate.todate) : null} 
                        onChange={(date) => setSelectedDate({ ...selectedDate, todate: date ? date.format("YYYY-MM-DD") : "" })} 
                        placeholder="DD-MM-YYYY" 
                    />
                </div>
                <button className="btn btn-dark pb-2" style={{ height: "40px" }} onClick={DeselectAll}>
                    Deselect All
                </button>
            </div>

            <Table
                dataSource={balances}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                loading={loading}
            />
        </div>
    );
};

export default BalanceSheet;
