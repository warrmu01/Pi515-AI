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
    singleMode: false, // Enable range mode
    numberOfMonths: 2,
    numberOfColumns: 2,
    format: "YYYY-MM-DD",
    minDate: new Date(), // ✅ Block past dates
    maxDate: addDays(new Date(), 5), // ✅ Block dates beyond 5 days from today
    maxDays: 5, // ✅ Max range of 5 days
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

    if (selectedDates.length !== 2 || !selectedDates[0] || !selectedDates[1]) {
      alert("Please select a valid start and end date.");
      return;
    }

    const startDate = selectedDates[0];
    const endDate = selectedDates[1];

    // Show loading while fetching
    predictionCard.style.display = "block";
    predictionLeft.innerHTML = `
      <h2>Selected Dates</h2>
      <p><strong>Start:</strong> ${startDate}</p>
      <p><strong>End:</strong> ${endDate}</p>
    `;
    predictionRight.innerHTML = `<p>Loading weather data...</p>`;

    try {
      // Fetch weather for Decorah
      const decorahWeather = await fetchWeather(
        43.303,
        -91.7857,
        startDate,
        endDate
      );

      // Fetch weather for Calmar
      const calmarWeather = await fetchWeather(
        43.1819,
        -91.866,
        startDate,
        endDate
      );

      // Show results
      predictionRight.innerHTML = `
        <h3>Decorah Weather:</h3>
        <p><strong>Max Temp:</strong> ${decorahWeather.avgMaxTemp}°C</p>
        <p><strong>Min Temp:</strong> ${decorahWeather.avgMinTemp}°C</p>
        <p><strong>December Rain (Total):</strong> ${decorahWeather.totalRain} mm</p>
        <hr />
        <h3>Calmar Weather:</h3>
        <p><strong>Max Temp:</strong> ${calmarWeather.avgMaxTemp}°C</p>
        <p><strong>Min Temp:</strong> ${calmarWeather.avgMinTemp}°C</p>
        <p><strong>Calmar Rain (Total):</strong> ${calmarWeather.totalRain} mm</p>
      `;

      console.log("Decorah Weather:", decorahWeather);
      console.log("Calmar Weather:", calmarWeather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      predictionRight.innerHTML = `<p>Failed to fetch weather data.</p>`;
    }
  });

  // Fetch weather helper function
  async function fetchWeather(lat, lon, start, end) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FChicago`;

    const response = await fetch(url);
    const data = await response.json();

    const tempsMax = data.daily.temperature_2m_max;
    const tempsMin = data.daily.temperature_2m_min;
    const rains = data.daily.precipitation_sum;

    // Calculate averages for temps
    const avgMaxTemp = (
      tempsMax.reduce((a, b) => a + b, 0) / tempsMax.length
    ).toFixed(1);
    const avgMinTemp = (
      tempsMin.reduce((a, b) => a + b, 0) / tempsMin.length
    ).toFixed(1);

    // Calculate total rain
    const totalRain = rains.reduce((a, b) => a + b, 0).toFixed(1);

    return { avgMaxTemp, avgMinTemp, totalRain };
  }
});
