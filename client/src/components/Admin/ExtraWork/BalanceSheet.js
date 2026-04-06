import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import { extraWorkAPI } from "../../../api/index";

const BalanceSheet = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const res = await extraWorkAPI.getBalances();
                setBalances(res.data);
            } catch (err) {
                console.error("Failed to fetch balances:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, []);

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

    if (loading) {
        return (
            <div className="text-center py-5 ">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", margin: "10px 30px" }}>
            <h5 className="mb-4">Real-Time Balance Sheet</h5>
            <Table
                dataSource={balances}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default BalanceSheet;
