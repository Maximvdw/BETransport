/**
 * DeLijnAPI
 *
 * @version 1.0
 * @author Maxim Van de Wynckel
 */

var ajax = require('ajax');

/**
 * Get station info
 *
 * @param code Station code
 * @return Parsed JSON array
 */
function getStation(code){
  var url = "http://data.irail.be/DeLijn/Stations.json?code=" + code;
  
  // Get the stations from the URL
  ajax({
    url: url,
    type: 'json'
    },
    function(data) {
      // Parse JSON data
      console.log("Station fetched from url '" + url + "'");
      
      var stations = data.Stations;
      
      var station = Station();
      station.setId(stations[0].id);
      station.setCode(stations[0].code);
      station.setName(stations[0].name);
      console.log("Station: " + station.getName() + " [" + station.getId() + "]");
      
      return station;
    },
    function(error) {
      // Error while contacting irail
      console.log("Unable to get station from url '" + url + "' !");
      
      return null;
    }
  );
}

/**
 * Get arrivals in station
 *
 * @param station Station
 * @return Array with Arrivals
 */
function getArrivals(station){
  var url = "https://data.irail.be/DeLijn/Arrivals/" + station.getCode();
  
  // Get the arrivals from the URL
  ajax({
    url: url,
    type: 'json'
    },
    function(data) {
      // Parse JSON data
      console.log("Arrivals fetched from url '" + url + "'");
      
      var arrivals = [];
      var arrival = Arrival();
      
      arrivals.push(arrival);
      
      return arrivals;
    },
    function(error) {
      // Error while contacting irail
      console.log("Unable to get arrivals from url '" + url + "' !");
      
      return null;
    }
  );
}


/**
 * Station class
 */
function Station(){
  this.id = 0;
  this.code = 0;
  this.name = "";
  
  this.getId = function(){
    return this.id;
  };
  this.setId = function(id){
    this.id = id;
  };
  this.getCode = function(){
    return this.code;
  };
  this.setCode = function(code){
    this.code = code;
  };
  this.getName = function() {
        return this.name;
  };
  this.setName = function(name){
    this.name = name;
  };
  
}


/**
 * Bus arrival at a station
 */
function Arrival(){
  this.bus = Bus();
  this.time = Date();
  
  this.getBus = function(){
    return this.bus;
  };
  this.setBus = function(bus){
    this.bus = bus;
  };
  this.getTime = function(){
    return this.time;
  };
  this.setTime = function(time){
    this.time = time;
  };
}

/**
 * Bus
 */
function Bus(){
  this.number = 0;
  this.name = "";
  
  this.getName = function() {
        return this.name;
  };
  this.setName = function(name){
    this.name = name;
  };
  this.getNumber = function(){
    return this.number;
  };
  this.setNumber = function(number){
    this.number = number;
  };
}