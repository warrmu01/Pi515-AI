// predict.js

document.addEventListener("DOMContentLoaded", function () {
  const predictButton = document.getElementById("predictButton");
  const dateRangePickerInput = document.getElementById("date-range-picker");
  const predictionCard = document.getElementById("predictionCard");
  const predictionTableBody = document.querySelector("#predictionTable tbody");

  // Initialize Litepicker
  const picker = new Litepicker({
    element: dateRangePickerInput,
    singleMode: false, // Enable range mode
    numberOfMonths: 2,
    numberOfColumns: 2,
    format: "YYYY-MM-DD",
    minDate: new Date(), // ✅ No past dates
    maxDate: addDays(new Date(), 5), // ✅ No dates beyond 15 days
    maxDays: 5, // ✅ Max 5 days range
    tooltipText: { one: "day", other: "days" },
    tooltipNumber: (totalDays) => totalDays,
  });

  // Helper function to add days to a date
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Predict button click event
  predictButton.addEventListener("click", async function () {
    const selectedDates = dateRangePickerInput.value.split(" - ");
    const fishCount = document.getElementById("fish-count").value;

    if (selectedDates.length !== 2 || !selectedDates[0] || !selectedDates[1]) {
      alert("Please select a valid start and end date.");
      return;
    }

    if (!fishCount) {
      alert("Please enter the fish count.");
      return;
    }

    // Validate dates
    const startDateObj = new Date(selectedDates[0]);
    const endDateObj = new Date(selectedDates[1]);
    const today = new Date();
    const maxAllowedDate = addDays(today, 15);

    if (endDateObj > maxAllowedDate) {
      alert("End date cannot be more than 15 days from today.");
      return;
    }

    const rangeInDays = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24);
    if (rangeInDays > 5) {
      alert("Date range cannot exceed 5 days.");
      return;
    }

    try {
      // Show loading
      predictionCard.style.display = "block";
      predictionTableBody.innerHTML = `<tr><td colspan="5">Loading predictions...</td></tr>`;

      // 🚀 Send request to Flask backend
      const response = await fetch("/predict", {
        // Update this if your backend endpoint is different
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: selectedDates[0],
          end_date: selectedDates[1],
          fish_count: fishCount,
        }),
      });

      const predictionData = await response.json();

      console.log("Prediction Data:", predictionData);

      // Populate table with predictions
      populatePredictionTable(predictionData);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      predictionTableBody.innerHTML = `<tr><td colspan="5">Failed to fetch predictions.</td></tr>`;
    }
  });

  // Function to populate the prediction table
  function populatePredictionTable(predictionData) {
    const tableBody = document.querySelector("#predictionTable tbody");

    tableBody.innerHTML = ""; // Clear old data

    predictionData.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.survival.toFixed(2)}</td>
        <td>${entry.am_transparency}</td>
        <td>${entry.pm_transparency}</td>
        <td>${entry.risk}</td>
      `;
      tableBody.appendChild(row);
    });

    predictionCard.style.display = "block"; // Show the prediction card
  }
});
