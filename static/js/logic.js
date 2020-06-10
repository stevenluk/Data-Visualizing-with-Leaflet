// Store our API endpoint inside earthquakeurl
var earthquakeurl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store our API endpoint inside tectonicplateurl
var tectonicplateurl="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Creat a layer for the tectonic plates
var tectonicplate=new L.LayerGroup();

// Add Fault lines data
d3.json(tectonicplateurl, function(tectonicdata) {
  // Adding our geoJSON data, along with style information, to the tectonicplates layer.
  L.geoJSON(tectonicdata, {
  color:"orange",
  weight:2
  })
  .addTo(tectonicplate)
});

// Perform a GET request to the earthquake URL
d3.json(earthquakeurl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
      "</he><hr><p>" + feature.properties.mag + "</p>");
    } 
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {

        //depends on the magnitude, dsiplay different color
        var color;
        if (feature.properties.mag  > 5){
          color="#ff0000"
        } 
        else if (feature.properties.mag  > 4){
          color="#fa6400"
        } 
        else if (feature.properties.mag  > 3){
          color="#faaf00"
        } 
        else if (feature.properties.mag  > 2){
          color="#fafa00"
        } 
        else if (feature.properties.mag  > 1){
          color="#96fa00"
        } 
        else{
          color= "#32fa00"
        }

      //provide properties for the circles
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }  
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define slightmap satellitemap and outdoormap layers
    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10', 
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic3RldmVubHVrIiwiYSI6ImNrYXRwNXNxeDA3Z20zMmwzdGJydnpxM3kifQ.M4vTek3VyUUq95E24h2mpg'
    });

    var satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9', 
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic3RldmVubHVrIiwiYSI6ImNrYXRwNXNxeDA3Z20zMmwzdGJydnpxM3kifQ.M4vTek3VyUUq95E24h2mpg'
    });

    var outdoormap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/outdoors-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1Ijoic3RldmVubHVrIiwiYSI6ImNrYXRwNXNxeDA3Z20zMmwzdGJydnpxM3kifQ.M4vTek3VyUUq95E24h2mpg'
  });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": lightmap,
        "Outdoors": outdoormap,
    };

    // Define a overlayMaps object to hold our overy layers
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates":tectonicplate
      };
    
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom:4,
        layers: [lightmap, earthquakes,tectonicplate]
      });
  
    // create a color function to show in legend  
    function getColor(d){
        return d > 5 ? "#ff0000" :
        d > 4 ? "#fa6400" :
        d > 3 ? "#faaf00" :
        d > 2 ? "#fafa00" :
        d > 1 ? "#96fa00" :
                 "#32fa00";
      }
    

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend"),
        grades=[0,1,2,3,4,5],
        labels = [];

        div.innerHTML+='Magnitude<br><hr>'

        for (var i=0; i<grades.length; i++){
            div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}

  