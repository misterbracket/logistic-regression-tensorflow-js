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
  //
  // renderHistogram("glucose-cont", data, "Glucose", {
  //   title: "Glucose concentration",
  //   xLabel:
  //     "Plasma glucose concentration (2 hour after glucose tolerance test)",
  // });
  //
  // renderHistogram("age-cont", data, "Age", {
  //   title: "Age",
  //   xLabel: "age (years)",
  // });
  //
  // renderScatter("glucose-age-cont", data, ["Glucose", "Age"], {
  //   title: "Glucose vs Age",
  //   xLabel: "Glucose",
  //   yLabel: "Age",
  // });
  //
  // renderScatter("skin-bmi-cont", data, ["SkinThickness", "BMI"], {
  //   title: "Skin thickness vs BMI",
  //   xLabel: "Skin thickness",
  //   yLabel: "BMI",
  // });

  // renderHistogram("insulin-cont", data, "Insulin", {
  //   title: "Insulin levels",
  //   xLabel: "Insulin 2-hour serum, mu U/ml",
  // });
  //
  // renderHistogram("glucose-cont", data, "Glucose", {
  //   title: "Glucose concentration",
  //   xLabel:
  //     "Plasma glucose concentration (2 hour after glucose tolerance test)",
  // });
  //
  // renderHistogram("age-cont", data, "Age", {
  //   title: "Age",
  //   xLabel: "age (years)",
  // });
  //
  // renderScatter("glucose-age-cont", data, ["Glucose", "Age"], {
  //   title: "Glucose vs Age",
  //   xLabel: "Glucose",
  //   yLabel: "Age",
  // });
  //
  // renderScatter("skin-bmi-cont", data, ["SkinThickness", "BMI"], {
  //   title: "Skin thickness vs BMI",
  //   xLabel: "Skin thickness",
  //   yLabel: "BMI",
  // });
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
  const diabetic = data.filter((r) => r.Outcome === 1);
  const healthy = data.filter((r) => r.Outcome === 0);

  var dTrace = {
    x: diabetic.map((r) => r[columns[0]]),
    y: diabetic.map((r) => r[columns[1]]),
    mode: "markers",
    type: "scatter",
    name: "Diabetic",
    opacity: 0.4,
    marker: {
      color: "gold",
    },
  };

  var hTrace = {
    x: healthy.map((r) => r[columns[0]]),
    y: healthy.map((r) => r[columns[1]]),
    mode: "markers",
    type: "scatter",
    name: "Healthy",
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
