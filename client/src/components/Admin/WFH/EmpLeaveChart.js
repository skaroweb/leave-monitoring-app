import { useState } from "react";

import { Bar, Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

const EmpLeaveChart = (props) => {
  const [selectedCharts, setSelectedCharts] = useState("");

  const handleChartSelection = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setSelectedCharts(selectedOptions);
  };

  const data = props.leaveCountName;
  const values = Object.keys(data).map((key) => data[key].days);
  const Names = Object.keys(props.leaveCountName).map((key) => data[key].name);

  const renderCharts = () => {
    if (selectedCharts.length === 0) {
      // Render default chart when no option is selected
      return <Bar data={state} options={chartOptions} />;
    }

    return selectedCharts.map((chartType, index) => {
      let chartComponent;
      switch (chartType) {
        case "bar":
          chartComponent = (
            <Bar key={index} data={state} options={chartOptions} />
          );
          break;
        case "line":
          chartComponent = (
            <Line key={index} data={state} options={chartOptions} />
          );
          break;
        case "pie":
          chartComponent = (
            <Pie key={index} data={state} options={chartOptions} />
          );
          break;
        default:
          chartComponent = null;
      }
      return chartComponent;
    });
  };

  const state = {
    labels: Names,
    datasets: [
      {
        label: "WFH",
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,

        data: values,
      },
    ],
  };
  const chartOptions = {
    // plugins: {
    //     legend: {
    //       display: false, // Hide the legend if not needed
    //     },
    // },
    layout: {
      padding: 0, // Remove any default padding
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide X-axis grid lines
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)", // Customize Y-axis grid lines color
        },
      },
    },
  };

  return (
    <div className="col-md-5">
      {/* <Bar data={state} options={chartOptions} /> */}
      <div className="col-md-5">
        <select
          className="form-select"
          value={selectedCharts}
          onChange={handleChartSelection}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie" selected>
            Pie Chart
          </option>
        </select>
      </div>

      {renderCharts()}
    </div>
  );
};
export default EmpLeaveChart;
