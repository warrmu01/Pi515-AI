let reportHistory = {}; // store predictions by date

document.addEventListener("DOMContentLoaded", function () {
  const predictButton = document.getElementById("predictButton");
  const dateRangePickerInput = document.getElementById("date-range-picker");
  const predictionCard = document.getElementById("predictionCard");
  const predictionLeft = document.getElementById("predictionLeft");
  const predictionTableBody = document.querySelector("#predictionTable tbody");

  // Initialize Litepicker
  const picker = new Litepicker({
    element: dateRangePickerInput,
    singleMode: false,
    numberOfMonths: 2,
    numberOfColumns: 2,
    format: "YYYY-MM-DD",
    minDate: new Date(),
    maxDate: addDays(new Date(), 5),
    maxDays: 5,
    tooltipText: { one: "day", other: "days" },
    tooltipNumber: (totalDays) => totalDays,
  });

  // Helper function to add days
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // On Predict button click
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

    const startDate = selectedDates[0];
    const endDate = selectedDates[1];

    predictionCard.style.display = "block";
    predictionTableBody.innerHTML = `<tr><td colspan="5">Fetching prediction...</td></tr>`;

    try {
      const processRes = await fetch("/process_dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          fish_count: fishCount,
        }),
      });

      const weatherData = await processRes.json();

      const predictionRes = await fetch("/predict_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weatherData),
      });

      const predictionData = await predictionRes.json();

      if (!Array.isArray(predictionData)) {
        predictionTableBody.innerHTML = `<tr><td colspan="5">Error: ${predictionData.error}</td></tr>`;
        return;
      }

      populatePredictionTable(predictionData, fishCount);
    } catch (error) {
      console.error("🔥 Error during prediction:", error);
      predictionTableBody.innerHTML = `<tr><td colspan="5">Failed to generate prediction</td></tr>`;
    }
  });

  function populatePredictionTable(data, fishCount) {
    predictionTableBody.innerHTML = "";

    data.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.am_transparency.toFixed(2)}</td>
        <td>${entry.pm_transparency.toFixed(2)}</td>
        <td>${entry.predicted_survival.toFixed(2)}</td>
        <td>${entry.risk_level}</td>
      `;
      predictionTableBody.appendChild(row);

      // Store for report generation
      reportHistory[entry.date] = {
        fishCount: fishCount,
        temp: entry.temperature || "N/A",
        rainfall: entry.rainfall || "N/A",
        amTransparency: entry.am_transparency,
        pmTransparency: entry.pm_transparency,
        survivalRate: entry.predicted_survival,
        riskLevel: entry.risk_level,
        suggestion: getSuggestion(entry.risk_level),
      };

      // Add to dropdown if not already there
      const dropdown = document.getElementById("report-date");
      if (![...dropdown.options].some((opt) => opt.value === entry.date)) {
        const option = document.createElement("option");
        option.value = entry.date;
        option.textContent = entry.date;
        dropdown.appendChild(option);
      }
    });
  }
});

// PDF Report Generator
function downloadReport() {
  const selectedDate = document.getElementById("report-date").value;
  const data = reportHistory[selectedDate];
  if (!data) return alert("No data found for the selected date.");

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("AquaVitals - Fish Survival Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Date: ${selectedDate}`, 20, 40);
  doc.text(`Fish Count: ${data.fishCount}`, 20, 50);
  doc.text(`Forecasted Temp: ${data.temp}°F`, 20, 60);
  doc.text(`Rainfall: ${data.rainfall} in`, 20, 70);
  doc.text(`AM Transparency: ${data.amTransparency}`, 20, 80);
  doc.text(`PM Transparency: ${data.pmTransparency}`, 20, 90);
  doc.text(`Survival Rate: ${data.survivalRate}%`, 20, 100);
  doc.text(`Risk Level: ${data.riskLevel}`, 20, 110);
  doc.text(`Suggested Action: ${data.suggestion}`, 20, 120, { maxWidth: 170 });

  doc.save(`AquaVitals-fishreport-${selectedDate}.pdf`);
}

// Suggestion helper based on risk
function getSuggestion(risk) {
  if (risk === "High")
    return "Delay stocking and feeding. Increase monitoring.";
  if (risk === "Medium")
    return "Monitor conditions closely. Avoid overfeeding.";
  return "Proceed with normal operations.";
}

async function downloadAllReports() {
  if (Object.keys(reportHistory).length === 0) {
    alert("No reports available to download.");
    return;
  }

  const zip = new JSZip();

  for (const date in reportHistory) {
    const data = reportHistory[date];

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("AquaVitals - Fish Survival Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 40);
    doc.text(`Fish Count: ${data.fishCount}`, 20, 50);
    doc.text(`Forecasted Temp: ${data.temp}°F`, 20, 60);
    doc.text(`Rainfall: ${data.rainfall} in`, 20, 70);
    doc.text(`AM Transparency: ${data.amTransparency}`, 20, 80);
    doc.text(`PM Transparency: ${data.pmTransparency}`, 20, 90);
    doc.text(`Survival Rate: ${data.survivalRate}%`, 20, 100);
    doc.text(`Risk Level: ${data.riskLevel}`, 20, 110);
    doc.text(`Suggested Action: ${data.suggestion}`, 20, 120, {
      maxWidth: 170,
    });

    const pdfBlob = doc.output("blob");
    zip.file(`FishReport-${date}.pdf`, pdfBlob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = "AquaVitals_Reports.zip";
  link.click();
}
