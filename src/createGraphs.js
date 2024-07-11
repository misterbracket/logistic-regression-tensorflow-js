import Plotly from "plotly.js-dist";
import _ from "lodash";

export const renderGraphs = (data) => {
  console.log("Rendering graphs...");

  renderHistogram(
    "interactive-demo-cont",
    data,
    "interactive_demo_completion",
    {
      title: "Interactive Demo",
      xLabel: "Interactive Demo Completion Rate",
    },
  );

  renderHistogram(
    "revisiting-lead-status-cont",
    data,
    "revisiting_lead_status",
    {
      title: "Revisiting Lead Status",
      xLabel: "Revisiting Lead Status in Percentage",
    },
  );

  // renderScatter(
  //   "lead-status-demo-cont",
  //   data,
  //   ["revisiting_lead_status", "interactive_demo_completion"],
  //   {
  //     title: "Interactive Demo vs Revisiting Lead Status",
  //     xLabel: "Revisiting Lead Status",
  //     yLabel: "Interactive Demo Completion Rate",
  //   },
  // );
};

export const renderOutcomes = (data) => {
  const outcomes = data.map((r) => r.has_converted);

  const [customer, noCustomer] = _.partition(outcomes, (o) => o === 1);

  const chartData = [
    {
      labels: ["Customer", "NoCustomer"],
      values: [customer.length, noCustomer.length],
      type: "pie",
      opacity: 0.6,
      marker: {
        colors: ["gold", "forestgreen"],
      },
    },
  ];

  Plotly.newPlot("outcome-cont", chartData, {
    title: "Customer vs NoCustomer",
  });
};

const renderHistogram = (container, data, column, config) => {
  const customer = data
    .filter((r) => r.has_converted === 1)
    .map((r) => r[column]);

  const noCustomer = data
    .filter((r) => r.has_converted === 0)
    .map((r) => r[column]);

  const customerTrace = {
    name: "customer",
    x: customer,
    type: "histogram",
    opacity: 0.6,
    marker: {
      color: "gold",
    },
  };

  const noCustomerTrace = {
    name: "noCustomer",
    x: noCustomer,
    type: "histogram",
    opacity: 0.4,
    marker: {
      color: "forestgreen",
    },
  };

  Plotly.newPlot(container, [customerTrace, noCustomerTrace], {
    barmode: "overlay",
    xaxis: {
      title: config.xLabel,
    },
    yaxis: { title: "Count" },
    title: config.title,
  });
};

const renderScatter = (container, data, columns, config) => {
  const customer = data.filter((r) => r.has_converted === 1);
  const noCustomer = data.filter((r) => r.has_converted === 0);

  var dTrace = {
    x: customer.map((r) => r[columns[0]]),
    y: customer.map((r) => r[columns[1]]),
    mode: "markers",
    type: "scatter",
    name: "Customer",
    opacity: 0.4,
    marker: {
      color: "gold",
    },
  };

  var hTrace = {
    x: noCustomer.map((r) => r[columns[0]]),
    y: noCustomer.map((r) => r[columns[1]]),
    mode: "markers",
    type: "scatter",
    name: "NoCustomer",
    opacity: 0.4,
    marker: {
      color: "forestgreen",
    },
  };

  var chartData = [dTrace, hTrace];

  Plotly.newPlot(container, chartData, {
    title: config.title,
    xaxis: {
      title: config.xLabel,
    },
    yaxis: { title: config.yLabel },
  });
};
