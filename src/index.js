import "./styles.css";

import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import * as Papa from "papaparse";
import _ from "lodash";
import { renderOutcomes, renderGraphs } from "./createGraphs.js";
import { runForm } from "./form.js";

const formSection = document.getElementById("form_section");

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
    "https://raw.githubusercontent.com/misterbracket/logistic-regression-tensorflow-js/main/src/data/fake_data_2.csv",
  );
  return csv.data;
};

//TODO: For now this only works with continuous features
const createDataSets = (data, features, testSize, batchSize) => {
  //These are the features that will be used to train the model
  const X = data.map((r) =>
    features.map((f) => {
      const val = r[f];
      return val === undefined ? 0 : val;
    }),
  );

  // The outcome of the model
  // We use one hot encoding to represent the outcome
  const y = data.map((r) => {
    const outcome = r.has_converted === undefined ? 0 : r.has_converted;
    return oneHot(outcome);
  });

  //Split the data into training and testing sets
  const splitIdx = parseInt((1 - testSize) * data.length, 10);

  // Create a dataset from the data
  // We zip the features and the outcome together
  // Shuffle the data and split it into batches
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

const trainLogisticRegression = async (featureCount, trainDs, validDs) => {
  const model = tf.sequential();
  // Add a dense layer
  // Dense layers are fully connected layers
  // units: 2, because we have 2 outcomes
  // activation: softmax, because we want to classify the data
  // softmax is a function that squashes the values between 0 and 1
  // inputShape: [featureCount], because we have featureCount number of features
  model.add(
    tf.layers.dense({
      units: 2,
      activation: "softmax",
      inputShape: [featureCount],
    }),
  );

  // Compile the model
  // we use adam optimizer that is a popular optimizer
  // loss: binaryCrossentropy, because we have 2 outcomes
  // we want to minimize the loss
  const optimizer = tf.train.adam(0.001);
  model.compile({
    optimizer: optimizer,
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  // Train the model
  const trainLogs = [];
  const lossContainer = document.getElementById("loss-cont");
  const accContainer = document.getElementById("acc-cont");
  console.log("Training...");
  // We train the model for 100 epochs meaning we go through the dataset 100 times
  // We also pass the validation data so we can see how the model performs on unseen data
  // We use callbacks to log the loss and accuracy
  // We also use tfvis to visualize the training process
  await model.fitDataset(trainDs, {
    epochs: 100,
    validationData: validDs,
    callbacks: {
      onEpochEnd: async (_, logs) => {
        trainLogs.push(logs);
        tfvis.show.history(lossContainer, trainLogs, ["loss", "val_loss"]);
        tfvis.show.history(accContainer, trainLogs, ["acc", "val_acc"]);
      },
    },
  });

  console.log("Model training completed");
  return model;
};

const run = async () => {
  const data = await prepareData();

  renderOutcomes(data);

  renderGraphs(data);

  const features = ["interactive_demo_completion", "revisiting_lead_status"];

  const [trainDs, validDs, xTest, yTest] = createDataSets(
    data,
    features,
    0.1,
    16,
  );

  const model = await trainLogisticRegression(
    features.length,
    trainDs,
    validDs,
  );

  // Evaluate the model
  // We use the test data to evaluate the model
  // We use the confusion matrix to see how the model performs

  // const preds = model.predict(xTest).argMax(-1);
  // const labels = yTest.argMax(-1);
  //
  // const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  //
  // const container = document.getElementById("confusion-matrix");
  //
  // tfvis.render.confusionMatrix(container, {
  //   values: confusionMatrix,
  //   tickLabels: ["NoCustomer", "Customer"],
  // });

  return model;
};

if (document.readyState !== "loading") {
  run().then((model) => {
    formSection.style.display = "flex";
    runForm(model);
  });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    run().then((model) => {
      formSection.style.display = "flex";
      runForm(model);
    });
  });
}
