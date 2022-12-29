const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");

const iconImg = document.getElementById("weather-icon");
const loc = document.querySelector("#location");
const tempC = document.querySelector(".c");
const tempF = document.querySelector(".f");
const desc = document.querySelector(".desc");
const sunriseDOM = document.querySelector(".sunrise");
const sunsetDOM = document.querySelector(".sunset");

// OpenWeatherMap API: removed to not share publicly
const apiKey = "4c36a8d*************************"; //Replace with your API

form.addEventListener("submit", e => {
  // prevent reloading of the page by stopping the form from submitting
  e.preventDefault();
  // get the value in the input field of the form
  const inputVal = input.value;
  // prevent duplicate requests: only a single request per city, per country should be executed
  const listItems = list.querySelectorAll(".ajax-section .city");
  const listItemsArray = Array.from(listItems);
  // 1. before making an AJAX request, check to see whether the unordered list is empty or not
  // not empty means at least one successful AJAX request has already been executed
  if (listItemsArray.length > 0) {
    // 2. check to see if there’s a list item who’s the city name or the value of its data-name attribute are equal to the search field’s value
    const filteredArray = listItemsArray.filter(el => {
      let content = "";
      //athens,gr 
      if (inputVal.includes(",")) {
        // e.g athens,grrrrrr is an invalid country code so we keep only the first part of inputVal 
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el.querySelector(".city-name span").textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        //e.g athens > no need to modify the inputVal here
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });
    // 3. this means the user already knows the weather for this city, so there’s no need to perform another AJAX request
  // thus, show them a related message, clear the value of the search field and give it focus
    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well`;
      form.reset();
      input.focus();
      return;
    }
  }
  
  // send a request to the OpenWeatherMap API with the city name, API key, and unit of temperature as parameters
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;
  // use fetch API to perform the AJAX request, pass the URL we want to access to the fetch() method
  fetch(url)
  // This method will return a Promise containing the HTTP response (a Response object)
  // To grab the response data in the desired JSON format (this is the default data format of OpenWeatherMap), we’ll use Response object’s json() method
  .then(response => response.json())
  // This method will return another Promise, and when it’s fulfilled, the data will be available for manipulation
  .then(data => {
    // build the list item component
    const { main, name, sys, weather } = data;
    // the API returns an icon code which holds the current weather condition for the target city
    // Based on this code, we’re able to construct the icon URL and display it in the card via the img tag
    const icon = `https://openweathermap.org/img/wn/${weather[0]["icon"]}@2x.png`;
    const li = document.createElement("li");
    li.classList.add("city");
    // Inside the .city-name element of each list item, we’ll append the data-name attribute with value the cityName,countryCode and then use this value to prevent duplicate requests
    const markup = ` 
    <h2 class="city-name" data-name="${name},${sys.country}"> 
    <span>${name}</span> 
    <sup>${sys.country}</sup> 
    </h2> 
    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> 
    </div> 
    <figure> 
    <img class="city-icon" src=${icon} alt=${weather[0]["main"]}> 
    <figcaption>${weather[0]["description"]}</figcaption> 
    </figure> 
    `;
    li.innerHTML = markup;
    list.appendChild(li);
  })
  // If for some reason the request is unsuccessful, a corresponding message will appear on the screen
  .catch(() => {
    msg.textContent = "Please search for a valid city";
  });
  // reset things
  msg.textContent = "";
  form.reset();
  input.focus();
});

// Use geolocation to grab the user’s location, and then perform an AJAX request for retrieving weather data for their closest cities
window.addEventListener("load", () => {
  let long;
  let lat;
  // Accessing Geolocation of User
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      // Storing Longitude and Latitude in variables
      long = position.coords.longitude;
      lat = position.coords.latitude;
      const base = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;

      // Using fetch to get data
      fetch(base)
        .then((response) => {
          return response.json();
        })
      // extracting the temperature data and storing it in a temp variable
        .then((data) => {
        const { temp, feels_like } = data.main;
        // store the place name
        const place = data.name;
        // description and icon code in the weather array
        const { description, icon } = data.weather[0];
        // stores times for the sunrise, sunset
        const { sunrise, sunset } = data.sys;

        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        const fahrenheit = (temp * 9) / 5 + 32;

        // Converting Epoch(Unix) time to GMT
        const sunriseGMT = new Date(sunrise * 1000);
        const sunsetGMT = new Date(sunset * 1000);

        // interact with the DOM elements to show the data
        iconImg.src = iconUrl;
        loc.textContent = `${place}`;
        desc.textContent = `${description}`;
        tempC.textContent = `${temp.toFixed(2)} °C`;
        tempF.textContent = `${fahrenheit.toFixed(2)} °F`;
        // convert GMT to local time
        sunriseDOM.textContent = `${sunriseGMT.toLocaleDateString()}, ${sunriseGMT.toLocaleTimeString()}`;
        sunsetDOM.textContent = `${sunsetGMT.toLocaleDateString()}, ${sunsetGMT.toLocaleTimeString()}`;
      });
    });
  }
});
