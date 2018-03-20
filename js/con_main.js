//JavaScript by Roseline Batcha

// Create the base map usng Mapbox layers
function createMap() {
    var map = L.map('map', {
        center: [10.18, 18.37],
        zoom: 2,
        minZoom: 3,
        maxZoom: 14,
        zoomControl: false
    });
   L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ZyYW1lOTM4IiwiYSI6ImNqN2RweG9ydjBkenIycWt5Z2c5NWtsajcifQ.bA0BviPhPcygQREBZd0cdQ', {
        attribution:"Thank to Mapbox and ACLED & SCAD  Africa for conflict Data 2017",
        minZoom: 3,
        maxZoom: 14,
        detectRetina: true

 
}).addTo(map);
           
L.control.scale().addTo(map);
L.control.zoom({
        position:'bottomright'
 }).addTo(map);
getData(map); 
}


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 3;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create marker options
     var attribute = "Con_2015";
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

   //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
    //For each feature, determine its value for the selected attribute
   var attValue = Number(feature.properties[attribute]);
   //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);
   //create circle markers
    return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
//Assign the current attribute based on the first index of the attributes array
var attribute = attributes[0];
//check
console.log(attribute);
//create marker options
 var options = {
        fillColor: "#ea202c",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

//For each feature, determine its value for the selected attribute
var attValue = Number(feature.properties[attribute]);
//Give each feature's circle marker a radius based on its attribute value
options.radius = calcPropRadius(attValue);
//create circle marker layer
var layer = L.circleMarker(latlng, options);
//original popupContent changed to panelContent...Example 2.2 line 1
 //create new popup
var popup = new Popup(feature.properties, attribute, layer, options.radius);
//build popup content string
var popupContent = "<p><b>countryname:</b> " + feature.properties.countryname + "</p>";
//add popup to circle marker
popup.bindToLayer();
    
//add formatted attribute to panel content string
var year = attribute.split("_")[1];
popupContent += "<p><b>Conflicts in " + year + ":</b> " + feature.properties[attribute] + " thousands</p>";
//bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false 
    });   
//event listeners to open popup on hover
layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
            
        }
    });
    
//bind the popup to the circle marker
layer.bindPopup(popupContent, {
offset: new L.Point(0,-options.radius)
});
    
//return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
//create a Leaflet GeoJSON layer and add it to the map
L.geoJson(data, {
pointToLayer: function(feature, latlng){
return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//Create new sequence controls
function createSequenceControls(map, attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse"><img src="images/back_circle.png"></button>');
            $(container).append('<button class="skip" id="forward" title="Forward"><img src="images/forward_circle.png"></button>');
            
            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
        }//end of onAdd: function
    });//end of Control.extend

    map.addControl(new SequenceControl());   

// click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
         } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;    
            
        };
// update slider
 $('.range-slider').val(index);
 updatePropSymbols(map, attributes[index]);        
    });
 $('.range-slider').on('input', function(){
  var index = $(this).val();
  updatePropSymbols(map, attributes[index]);    
    });
}
// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
 map.eachLayer(function(layer){
 if (layer.feature && layer.feature.properties[attribute]){
  //access feature properties
            var props = layer.feature.properties;

  //update each feature's radius based on new attribute values
   var radius = calcPropRadius(props[attribute]);
   layer.setRadius(radius);        
   var popup = new Popup(props, attribute, layer, radius);
            //add popup to circle marker
   popup.bindToLayer();    
   //add city to popup content string     
    var popupContent = "<p><b>countryname:</b> " + props.countryname + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Conflicts in " + year + ":</b> " + props[attribute] + " thousands</p>";
    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
        };
    });
};

//Example 1.2 line 1...Popup constructor function
function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute.split("_")[1];
    this.conflicts = this.properties[attribute];
    this.content = "<p><b>City:</b> " + this.properties.countryname + "</p><p><b>Conflicts in " + this.year + ":</b> " + this.population + " thousands</p>";

    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0,-radius)
        });
    };
};


function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>countryname:</b> " + properties.countryname + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Conflicts in " + year + ":</b> " + properties[attribute] + " thousands</p>";
    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
       onAdd: function (map) {
            // create the control container
            var container = L.DomUtil.create('div', 'legend-control-container');
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="100px">';
            //array of circle names to base loop on
            var circles = {
            max: 20,
            mean:40,
            min: 60
            };
            //loop to add each circle and text to svg string
            for (var circle in circles){
            //circle string
              svg += '<circle class="legend-circle" id="' + circle + '" fill="#ea202c" fill-opacity="0.8" stroke="#000000" cx="6"/>';
            //text string
              svg += '<text id="' + circle + '-text" x="110" y="' + circles[circle] + '"></text>';
            };
            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
    //assign current attribute to first index of array, starting legend text
    updateLegend(map, attributes[0]);
};//end of createLegend

//update text and circles in legend
function updateLegend(map, attribute){
    var year = attribute.split("_")[1];
    var legendContent = "Conflicts Crisis in Africa: 2007-2017";
    $('#temporal-legend').html(legendContent);
    var circleValues = getCircleValues(map, attribute);
    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);
        //Assign the cy and r attributes
        $('#'+key).attr({
            cy: 80 - radius,
            r: radius
        });
        if (circleValues[key]<1){
          $('#'+key+'-text').text("1");
        } else{
          $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 );
        };
    };
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
        //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//build an attributes array from the data
function processData(data){
 //empty array to hold attributes
    var attributes = [];

//properties of the first feature in the dataset
    var properties = data.features[0].properties;

//push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Con") > -1){
            attributes.push(attribute);
        };
    };
//check result
    console.log(attributes);

    return attributes;
};


// Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/map.geojson", {
        dataType: "json",
        success: function(response){
            
       //create an attributes array
            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);

            createLegend(map, attributes);
        }
    });
};


$(document).ready(createMap);