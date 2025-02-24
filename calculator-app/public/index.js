document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("savingsModal").style.display = "none";
});

// Constants
const TNB_TARIFF = 0.509;
const SOLAR_PANEL_COST = 3000;
const PEAK_SUN_HOURS = 3;
const INTEREST_RATE = 5;
const TARGET_SAVINGS = 0.3;

// input field with id "tnb_amount"
let tnd_input = document.getElementById("tnb_amount");

// Select all inputs with class "input-field"
const inputs = document.querySelectorAll(".input-field");

const calculateLoanPayment = (principal, annualRate, months) => {
  let monthlyRate = annualRate / 12 / 100;
  let payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return payment;
};

// Prevent 'e' input in the number field
tnd_input.addEventListener("keydown", function (event) {
  if (
    event.key === "e" ||
    event.key === "E" ||
    event.key === "-" ||
    event.key === "+"
  ) {
    event.preventDefault();
  }
});

const validateInput = (event) => {
  const input = event.target;
  const value = input.value.trim();

  // Check if the field is empty, null, or "undefined"
  if (value === "" || value === null || value === "undefined") {
    input.classList.add("error");
    return;
  }

  // Email validation
  if (input.type === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      input.classList.add("error");
      return;
    }
  } else {
    // For text fields, check if there's at least one letter or number
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);

    if (!(hasNumber || hasLetter)) {
      input.classList.add("error");
      return;
    }
  }

  // If everything is valid, remove the error class
  input.classList.remove("error");
};

// Attach event listener to each input
inputs.forEach((input) => {
  input.addEventListener("input", validateInput);
});

const CALCULATE_BTN = document
  .getElementById("calc_savings_btn")
  .addEventListener("click", () => {
    // Current Monthly Bill
    let currentBill = tnd_input.value.trim(); // Example current monthly bill in RM with trim to remove whitespace

    // Check if the input is empty or not a number
    if (currentBill === "" || isNaN(currentBill) || Number(currentBill) <= 0) {
      tnd_input.classList.add("error");
      return;
    } else {
      tnd_input.classList.remove("error");
      document.getElementById("savingsModal").style.display = "flex";
    }
  });

const SUBMIT = document
  .getElementById("submit")
  .addEventListener("click", () => {
    let flag = true;

    inputs.forEach((input) => {
      validateInput({ target: input }); // Validate all inputs
      if (input.classList.contains("error")) {
        flag = false;
      }
    });

    if (flag) {
      // Current Monthly Bill
      let currentBill = tnd_input.value; // Example current monthly bill in RM

      // System Sizing Calculation
      let monthlyEnergy = currentBill / TNB_TARIFF;
      let dailyEnergy = monthlyEnergy / 30;
      let systemSize = dailyEnergy / (PEAK_SUN_HOURS * 0.8);

      // Cost Calculation
      let totalSystemCost = systemSize * SOLAR_PANEL_COST;

      // Loan Payment Calculation
      let targetMonthlyPayment = currentBill * (1 - TARGET_SAVINGS);
      let loanTermMonths = 60; // Example loan term in months

      let monthlyPayment = calculateLoanPayment(
        totalSystemCost,
        INTEREST_RATE,
        loanTermMonths
      );

      displayResults(
        systemSize.toFixed(2),
        totalSystemCost.toFixed(2),
        targetMonthlyPayment.toFixed(2),
        monthlyPayment.toFixed(2)
      );
      
      post_data(
        systemSize.toFixed(2),
        totalSystemCost.toFixed(2),
        targetMonthlyPayment.toFixed(2),
        monthlyPayment.toFixed(2),
        document.getElementById("username").value.trim(),
        document.getElementById("email").value.trim(),
        document.getElementById("state").value,
      );

      document.getElementById("savingsModal").style.display = "none";
    }
  });

const displayResults = (
  systemSize,
  totalSystemCost,
  targetMonthlyPayment,
  monthlyPayment
) => {
  document.getElementById("systemSize").innerHTML = `${systemSize} kwp`;
  document.getElementById(
    "totalSystemCost"
  ).innerHTML = `RM ${totalSystemCost}`;
  document.getElementById(
    "targetMonthlyPayment"
  ).innerHTML = `RM ${targetMonthlyPayment}`;
  document.getElementById("monthlyPayment").innerHTML = `RM ${monthlyPayment}`;
};

const post_data = (
  systemSize,
  totalSystemCost,
  targetMonthlyPayment,
  monthlyPayment,
  username,
  email,
  state
) => {
  const data = {
    systemSize: systemSize,
    totalSystemCost: totalSystemCost,
    targetMonthlyPayment: targetMonthlyPayment,
    monthlyPayment: monthlyPayment,
    name: username,
    email: email,
    state: state,
  };

  fetch(`${process.env.URL}/v1/savings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
