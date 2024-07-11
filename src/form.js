import * as tf from "@tensorflow/tfjs";

// Form submission
export const runForm = async (model) => {
  const form = document.getElementById("form_calulation");
  const demoInput = document.getElementById("demo_completion_input");
  const leadStatusInput = document.getElementById(
    "revisiting_lead_status_input",
  );

  const submitCalculation = (e) => {
    e.preventDefault();
    document.getElementByName;

    console.log("DEMO_INPUT", demoInput.value);
    console.log("LEAD_SOURCE_INPUT", leadStatusInput.value);

    //get data from form and predict
    const formData = {
      interactive_demo_completion: demoInput.value / 100,
      revisiting_lead_status: leadStatusInput.value / 100,
    };

    //create tensor from data
    const tensorData = tf.tensor([Object.values(formData)]);

    //predict
    const prediction = model.predict(tensorData);
    console.log("PREDICTION", prediction);

    // get the outcome
    const outcome = prediction.argMax(-1).dataSync()[0];
    console.log("OUTCOME:", outcome);

    const outcomeElement = document.getElementById("outcome");
    outcomeElement.style.display = "block";
    outcomeElement.innerText =
      outcome === 0 ? "They won't be a Customer" : "They will be a Customer";
    outcomeElement.style.color = outcome === 0 ? "red" : "green";
  };

  form.addEventListener("submit", submitCalculation);
};
