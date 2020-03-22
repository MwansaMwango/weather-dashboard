$(document).ready(() => {
  
  var today = moment();
  var cities =[];
  var forecastDate; //store date of future forecast date
  var numSavedCities = 8; //number of cities to store in local storage

  displayCities();

  $("#search-btn").on("click", function() {
    var city = $("#search-term").val().trim();
    generateWeatherData(city);
  });

    
  $("#search-term").on("keypress", function(e) {
    if (e.target.id === "search-term" & e.keyCode===13) { // 'enter' key is pressed
      var city = $("#search-term").val().trim();
      generateWeatherData(city);
    }
  });

 $(document).on("click", '.city-btn', function() { // dynamically created element needs to be accessed via DOM
    var city = $(this).text();
    generateWeatherData(city);
  });

    
  function generateWeatherData (city) {
      var APIkey = "e71f6c6dc07b2b2d8673b9606f186bc7";
      var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=" + APIkey;
        
      $.ajax({
        url: queryForecastURL,
        method: "GET"
      }).then(function(response) {

        var city = response.city.name;
        var country = response.city.country;
        var lon = response.city.coord.lon;
        var lat = response.city.coord.lat;
        var currentDataCaptured = false; // flag used to capture current data weather data
        
        $("#forecast-card-group").empty();
        
        // Store newly searched city
        if (!cities.includes(city)) {
          cities.unshift(city); // add newly search city at beginning of array
          cities = cities.splice(0,numSavedCities) // retain the first 4 elements : remove 8 elements from index 0
          localStorage.setItem('storedCities', JSON.stringify(cities));
          displayCities(); // render saved cities
          }

      for (var i = 0; i < response.list.length; i++) { // iterate through the returned object 30hourly waether data
        
        var weatherIcon = "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png";
        var iDate = moment(response.list[i].dt_txt); // get response index date/timestamp from response array list into moment.js object
        var iDateDay = iDate.format("DD"); 

        
        if (!currentDataCaptured) { // if current day weather NOT captured yet

          $("#currentCity").text(city + ", " + country);
          $("#currentDate").text(today.format("DD/MM/YYYY"))
          $("#currentWeatherIcon").attr("src", weatherIcon );
          $("#currentTemp").text("Temperature: "+ response.list[i].main.temp+" \xB0C");
          $("#currentHumidity").text("Humidity: "+ response.list[i].main.humidity+" %");
          $("#currentWindSpeed").text("Wind Speed: "+ response.list[i].wind.speed +" MPH");
          currentDataCaptured = true; // current day data now captured
          forecastDate = iDate.add(1, 'day'); // add 1 to set expected forecast date to compare with
          var forecastDateDay = forecastDate.format("DD");

        }
         //get weather data for forecast dates
          
            console.log(iDateDay);
            console.log(forecastDateDay);
            console.log(iDateDay === forecastDateDay);

        if (iDateDay === forecastDateDay) { // capture if index date is equal to forecast date

            forecastDate = iDate.format("DD/MM/YYYY")

            // create weather forecast cards
            card = $("<div>").addClass("card bg-primary border-info m-1 shadow-lg");
            cardBody = $("<div>").addClass("card-body");
            cardTitle = $("<h5>").addClass("card-title");
            cardTitle.text(forecastDate);
            cardImg = $("<img>").addClass("card-img-top");
            cardImg.attr("src", weatherIcon );
            cardImg.attr("alt", "weather icon");
            
            cardTemp = $("<p>");
            cardTemp.addClass("card-text");
            cardTemp.text("Temp: " + response.list[i].main.temp +" \xB0C");
            
            cardHumidity = $("<p>");
            cardHumidity.addClass("card-text");
            cardHumidity.text("Humidity: " + response.list[i].main.humidity +" %");
            
            cardBody.append(cardTitle);        
            cardBody.append(cardImg);
            cardBody.append(cardTemp);
            cardBody.append(cardHumidity);
        
            card.append(cardBody);

            $("#forecast-card-group").append(card);
            $("#forecast-card-group").append($("<br>"));
            
            //Increment next day forecast 
            forecastDate = iDate.add(1, 'day');
            forecastDateDay = forecastDate.format("DD"); //re-assign new expected forecast day to compate next response index date
        }

      }; //for loop
      
      // UV index required seperate API call 

      uvQueryURL ="https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon +"&appid=" + APIkey;
  
      $.ajax({
        url: uvQueryURL,
        method: "GET"
      }).then(function(response) {

        uvIndex = response.value;
        $("#UVlabel").text("UV Index: ");
        $("#currentUVIndex").html(uvIndex);

        // set UV index styling based on value

        if (uvIndex <=2){
          $("#currentUVIndex").addClass("bg-success rounded px-2 mb-auto");
        }
        else if (uvIndex>2 & uvIndex <=5) {
          $("#currentUVIndex").addClass("bg-warning rounded px-2 mb-auto");
        }
        else {
          $("#currentUVIndex").addClass("bg-danger rounded px-2 mb-auto");
        }

      });

    }); // generateWeatherData
  }
  function displayCities() {
    
    $("#cities-group").empty();
    var savedCities = localStorage.getItem("storedCities");

      if  (savedCities) { // if saved cities exist
        savedCities = JSON.parse(savedCities);
          for ( i = 0; i < numSavedCities ; i++ ){ // only display last saved cities
                if (!savedCities[i]) { //exit function if less than 8 saved cities
                  return
                }
                var cityBtn = $("<button>").addClass('city-btn btn btn-outline-light text-white btn-block bg-primary mb-2');
                cityBtn.text(savedCities[i]);
                $("#cities-group").append(cityBtn);
               
          }
      }
       
  }
});

