import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const excelBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(excelBlob, "Employee-wfh-data.xlsx");
};
const ExcelReport = (props) => {
  const jsonData = props.items;

  const generateExportData = () => {
    return jsonData.map((obj) => ({
      createdAt: new Date(obj.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      name: obj.name,
      status: obj.status,
      applydate: new Date(obj.applydate).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      absencetype: obj.absencetype,
      reason: obj.reason,
      workFromHome: obj.workFromHome,
    }));
  };

  const handleExport = () => {
    exportToExcel(generateExportData());
  };
  return (
    <div className="export_to_excel">
      {/* Your component content goes here */}
      <button onClick={handleExport}>Export</button>
    </div>
  );
};
export default ExcelReport;
