import "./styles.css";

import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import * as Papa from "papaparse";
import _ from "lodash";

// Complete tutorial:
// http://bit.ly/Predicting-Diabetes-using-Logistic-Regression

Papa.parsePromise = function (file) {
  return new Promise(function (complete, error) {
    Papa.parse(file, {
      header: true,
      download: true,
      dynamicTyping: true,
      complete,
      error,
    });
  });
};

const oneHot = (outcome) => Array.from(tf.oneHot(outcome, 2).dataSync());

const prepareData = async () => {
  const csv = await Papa.parsePromise(
    "https://raw.githubusercontent.com/curiousily/Logistic-Regression-with-TensorFlow-js/master/src/data/diabetes.csv"
  );

  return csv.data;
};

const createDataSets = (data, features, testSize, batchSize) => {
  const X = data.map((r) =>
    features.map((f) => {
      const val = r[f];
      return val === undefined ? 0 : val;
    })
  );
  const y = data.map((r) => {
    const outcome = r.Outcome === undefined ? 0 : r.Outcome;
    return oneHot(outcome);
  });

  const splitIdx = parseInt((1 - testSize) * data.length, 10);

  const ds = tf.data
    .zip({ xs: tf.data.array(X), ys: tf.data.array(y) })
    .shuffle(data.length, 42);

  return [
    ds.take(splitIdx).batch(batchSize),
    ds.skip(splitIdx + 1).batch(batchSize),
    tf.tensor(X.slice(splitIdx)),
    tf.tensor(y.slice(splitIdx)),
  ];
};

const renderOutcomes = (data) => {
  const outcomes = data.map((r) => r.Outcome);

  const [diabetic, healthy] = _.partition(outcomes, (o) => o === 1);

  const chartData = [
    {
      labels: ["Diabetic", "Healthy"],
      values: [diabetic.length, healthy.length],
      type: "pie",
      opacity: 0.6,
      marker: {
        colors: ["gold", "forestgreen"],
      },
    },
  ];

  Plotly.newPlot("outcome-cont", chartData, {
    title: "Healthy vs Diabetic",
  });
};

const trainLogisticRegression = async (featureCount, trainDs, validDs) => {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 2,
      activation: "softmax",
      inputShape: [featureCount],
    })
  );
  const optimizer = tf.train.adam(0.001);
  model.compile({
    optimizer: optimizer,
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });
  const trainLogs = [];
  const lossContainer = document.getElementById("loss-cont");
  const accContainer = document.getElementById("acc-cont");
  console.log("Training...");
  await model.fitDataset(trainDs, {
    epochs: 100,
    validationData: validDs,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        trainLogs.push(logs);
        tfvis.show.history(lossContainer, trainLogs, ["loss", "val_loss"]);
        tfvis.show.history(accContainer, trainLogs, ["acc", "val_acc"]);
      },
    },
  });

  return model;
};

const run = async () => {
  const data = await prepareData();

  renderOutcomes(data);

  const features = ["Glucose"];

  const [trainDs, validDs, xTest, yTest] = createDataSets(
    data,
    features,
    0.1,
    16
  );

  const model = await trainLogisticRegression(
    features.length,
    trainDs,
    validDs
  );

  const preds = model.predict(xTest).argMax(-1);
  const labels = yTest.argMax(-1);

  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);

  const container = document.getElementById("confusion-matrix");

  tfvis.render.confusionMatrix(container, {
    values: confusionMatrix,
    tickLabels: ["Healthy", "Diabetic"],
  });
};

if (document.readyState !== "loading") {
  run();
} else {
  document.addEventListener("DOMContentLoaded", run);
}
