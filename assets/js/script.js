$(document).ready(function () {
  renderCities();
  //function that gets the current data and formats it.
  function getCurrentDate() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
  }
  //function that gets days in the future so I can add them to forecast cards
  function forecastDates(date, days) {
    var newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  //function that saves the form input to local storage and turns them into a button
function renderCities() { 
  var savedCities = JSON.parse(localStorage.getItem("cities")) || [];
  $("#selected-cities").empty();

  savedCities.forEach(function (city){
    var cityButton = $("<button>")
    .addClass("list-group-item list-group-item-action city-button")
    .text(city);
    $("#selected-cities").append(cityButton);
  });
}
  //this function will grab the proper api data and display it on the webpage by targeting HTML elements
  function getWeather(cityName) {
    var apiKey = "b08d7e9a0b07620b03167858bb4373d0";
    var currentUrl =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      apiKey +
      "&units=imperial";
    var forecastUrl =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      cityName +
      "&appid=" +
      apiKey +
      "&units=imperial";
    // ajax call to get the weather data for today
    $.ajax({
      url: currentUrl,
      method: "GET",
      dataType: "json",
      success: function (response) {
        // code to display current weather conditions here
        var savedCities = JSON.parse(localStorage.getItem("cities")) || [];
        if (!savedCities.includes(cityName)) {
          savedCities.push(cityName);
          localStorage.setItem("cities", JSON.stringify(savedCities));
          renderCities();
        }
        var formattedDate = getCurrentDate();
        var iconCode = response.weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
        $("#city-name").html(`${response.name} (${formattedDate})`);
        $("#temperature").text(response.main.temp + "°F");
        $("#humidity").text(response.main.humidity + "%");
        $("#wind-speed").text(response.wind.speed + " m/s");
        $("#condition-icon").html(`<img src="${iconUrl}" alt="Weather icon">`);
      },
      //error to tell the user when theyve input a city name that does not exist
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + textStatus + " - " + errorThrown);
      },
    });
    // ajax call to get the weather data for the 5 day forcast
    $.ajax({
      url: forecastUrl,
      method: "GET",
      dataType: "json",
      success: function (response) {
        // code to display 5 day forecast here
        var forecasts = response.list.filter(function (forecast) {
          return forecast.dt_txt.includes("12:00:00");
        });

        forecasts.forEach(function (forecast, index) {
          var date = new Date(forecast.dt * 1000);
          var currentDate = new Date();
          var forecastDate = forecastDates(currentDate, index + 1);
          var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            date.getDay()
          ];
          var iconUrl =
            "http://openweathermap.org/img/w/" +
            forecast.weather[0].icon +
            ".png";
          var month = forecastDate.getMonth() + 1;
          var day = forecastDate.getDate();
          var year = forecastDate.getFullYear();
          var formattedDate = `${month}/${day}/${year}`;
          var card = `
            <div class="card">
                <div class="card-body">
                    <h5>${dayOfWeek}</h5>
                    <img src="${iconUrl}" alt="Weather icon">
                    <p>Temperature: ${forecast.main.temp}°F</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                    <p>(${formattedDate})</p>
                </div>
            </div>
        `;

          $("#forecast-" + (index + 1)).html(card);
        });
      },
      //error to tell the user when theyve input a city name that does not exist
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + textStatus + " - " + errorThrown);
      },
    });
  }
  // jquery event lister so the site knows when to run the code to grab the weather for the city name input on the form
  $("form").on("submit", function (event) {
    event.preventDefault();
    var cityName = $("#search").val().trim();
    getWeather(cityName);
  });
  $(document).on("click", ".city-button", function () {
    var cityName = $(this).text();
    getWeather(cityName);
  });
});
