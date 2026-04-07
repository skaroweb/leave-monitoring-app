import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  if (data && data.length > 0) {
    const columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));
    worksheet.columns = columns;
    worksheet.addRows(data);
  }

  const excelBuffer = await workbook.xlsx.writeBuffer();
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

  const handleExport = async () => {
    await exportToExcel(generateExportData());
  };
  return (
    <div className="export_to_excel">
      {/* Your component content goes here */}
      <button onClick={handleExport}>Export</button>
    </div>
  );
};
export default ExcelReport;
