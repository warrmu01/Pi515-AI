// predict.js

document.addEventListener("DOMContentLoaded", function () {
  const predictButton = document.getElementById("predictButton");
  const dateRangePickerInput = document.getElementById("date-range-picker");
  const predictionCard = document.getElementById("predictionCard");
  const predictionLeft = document.getElementById("predictionLeft");
  const predictionRight = document.getElementById("predictionRight");

  // Initialize Litepicker
  const picker = new Litepicker({
    element: dateRangePickerInput,
    singleMode: false, // Enable range selection
    numberOfMonths: 2,
    numberOfColumns: 2,
    format: "YYYY-MM-DD",
    tooltipText: { one: "day", other: "days" },
    tooltipNumber: (totalDays) => totalDays - 1,
  });

  predictButton.addEventListener("click", function () {
    const selectedDates = dateRangePickerInput.value.split(" - ");

    if (selectedDates.length !== 2 || !selectedDates[0] || !selectedDates[1]) {
      alert("Please select a valid start and end date.");
      return;
    }

    const startDate = selectedDates[0];
    const endDate = selectedDates[1];

    // Show result
    predictionCard.style.display = "block";
    predictionLeft.innerHTML = `
      <h2>Selected Dates</h2>
      <p><strong>Start:</strong> ${startDate}</p>
      <p><strong>End:</strong> ${endDate}</p>
    `;

    predictionRight.innerHTML = `
      <p>Prediction Results will go here...</p>
    `;

    console.log("Start:", startDate, "End:", endDate);
  });
});
