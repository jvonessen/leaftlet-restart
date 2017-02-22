var TripCheck = {weatherIntervals: []};

// API call URLS
TripCheck.geocode_URL = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAtsQkI9rXQT7kf36Giu_qms_Ksowljab4&address=';
TripCheck.weather_URL = 'http://api.wunderground.com/api/7bf2e0a9dad48df1/forecast/q/'

// initiate map and add basic tile layer, currently launches on London.
TripCheck.map = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoianZvbmVzc2VuIiwiYSI6ImNpeXVwaTQ2azAxc3Ayd21ocGw3ZnY4NHcifQ.Ae31-8rR2qFmyiYaBtwf_A'
}).addTo(TripCheck.map);

//fetch route and render onto map
TripCheck.fetchAndRenderRoute = function() {
  TripCheck.routeData = L.Routing.control({
    waypoints: [
      L.latLng(TripCheck.originLat, TripCheck.originLng),
      L.latLng(TripCheck.destinationLat, TripCheck.destinationLng)
    ],
    showAlternatives: true,
    collapsible: true,
    units: 'imperial',
    router: L.Routing.mapbox('pk.eyJ1IjoianZvbmVzc2VuIiwiYSI6ImNpeXVwaTQ2azAxc3Ayd21ocGw3ZnY4NHcifQ.Ae31-8rR2qFmyiYaBtwf_A'),
  }).addTo(TripCheck.map);
  $(".leaflet-routing-container").addClass("leaflet-routing-container-hide");
};

//find waypoint coordinates for intermediary weather data
TripCheck.waypoints = function() {
  console.log(TripCheck.routeData);
  // console.log(TripCheck.routeData._routes[0]);
  var altNum = TripCheck.routeData._routes.length;
  var numofChecks, intervalofChecks, totalDistance, checkSpots;
  for (i=0;i<altNum;i++) {
    totalDistance = TripCheck.routeData._routes[i].summary.totalDistance;
    numofChecks = Math.floor(totalDistance/160934);
    intervalofChecks = TripCheck.routeData._routes[i].coordinates.length/numofChecks;
    while (checkSpots<TripCheck.routeData._routes[i].coordinates.length) {
      // TripCheck.weatherIntervals.append({TripCheck.routeData._routes[checkSpots].})
      console.log('adding check spot');
      checkSpots += checkSpots;
    }
  }
}

// Getting weather data
TripCheck.getWeatherData = function() {
  axios.get(TripCheck.weather_URL + TripCheck.originLat + ',' + TripCheck.originLng + '.json')
    .then(function(response){
      console.log(response.data);
        var originIcon = L.icon({
          iconUrl: response.data.forecast.simpleforecast.forecastday[0].icon_url,
          iconAnchor:   [22, 85], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
      });
      L.marker([TripCheck.originLat, TripCheck.originLng], {icon: originIcon}).addTo(TripCheck.map);
    })
  axios.get(TripCheck.weather_URL + TripCheck.destinationLat + ',' + TripCheck.destinationLng + '.json')
      .then(function(response){
        console.log(response.data);
          var destinationIcon = L.icon({
            iconUrl: response.data.forecast.simpleforecast.forecastday[0].icon_url,
            iconAnchor:   [22, 85], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        L.marker([TripCheck.destinationLat, TripCheck.destinationLng], {icon: destinationIcon}).addTo(TripCheck.map);
      })
}

// starts routing process on button click
$(".button").click(function(event) {
  $(".input-page").addClass('hidden');
  origin = document.getElementById('start-input').value.replace(/ /g, '+');
  destination = document.getElementById('end-input').value.replace(/ /g, '+');
  axios.all([
    axios.get(TripCheck.geocode_URL + origin)
      .then(function(response) {
        TripCheck.originLat = response.data.results[0].geometry.location.lat;
        TripCheck.originLng = response.data.results[0].geometry.location.lng;
      }),
    axios.get(TripCheck.geocode_URL + destination)
      .then(function(response) {
        TripCheck.destinationLat = response.data.results[0].geometry.location.lat;
        TripCheck.destinationLng = response.data.results[0].geometry.location.lng;
      })
    ])
    .then(function() {
      TripCheck.fetchAndRenderRoute();
    })
    .then(function() {
      TripCheck.waypoints();
    })
    .then(function() {
      TripCheck.getWeatherData();
    })
})
