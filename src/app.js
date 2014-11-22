/**
 * BETransport
 *
 * This Pebble application made to stay up to date
 * with the Belgian public transport supports
 * DeLijn, MIVB/STIB, NMBS and TEC
 *
 * The application uses public data fetched from the irail.be
 * site.
 *
 * @version 1.0.0
 * @author Maxim Van de Wynckel
 */

// Pebble Imports
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
  

/**
 * DeLijnAPI
 *
 * @version 1.0
 * @author Maxim Van de Wynckel
 */
var DeLijn = {  
  /**
   * Get station info
   *
   * @param code Station code
   * @return Parsed JSON array
   */
  getStation: function(code){
    var url = "http://data.irail.be/DeLijn/Stations.json?code=" + code;
    
    var output = null;
    // Get the stations from the URL
    ajax({
      url: url,
      type: 'json',
      async: false
      },
      function(data) {
        // Parse JSON data
        console.log("Station fetched from url '" + url + "'");
        
        var stations = data.Stations;
        
        var station = new DeLijn.Station();
        station.setId(stations[0].id);
        station.setCode(stations[0].code);
        station.setName(stations[0].name);
        console.log("Station: " + station.getName() + " [" + station.getId() + "]");
        
        output = station;
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get station from url '" + url + "' !");
        
        output = null;
      }
    );
    return output;
  },
  
  /**
   * Get arrivals in station
   *
   * @param station Station
   * @param count Max count
   * @return Array with Arrivals
   */
  getArrivals: function(station,count){
    var d = new Date();
    var url = "https://data.irail.be/DeLijn/Arrivals/" + station.getId() + "/" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getHours() + "/" + d.getMinutes() + ".json?rowcount=" + count;
    var output = null;
    // Get the arrivals from the URL
    ajax({
      url: url,
      type: 'json',
      async: false
      },
      function(data) {
        // Parse JSON data
        console.log("Arrivals fetched from url '" + url + "'");
        
        var arrivals = [];
        console.log("Found '" + data.Arrivals.length + "' arrivals!");
        for (var i in data.Arrivals){
          var arrival = new DeLijn.Arrival();
          var bus = new DeLijn.Bus();
          bus.setNumber(data.Arrivals[i].short_name);
          bus.setName(data.Arrivals[i].long_name);
          arrival.setBus(bus);
          arrival.setTime(new Date(data.Arrivals[i].time * 1000));
          arrivals.push(arrival); 
        }
        
        output = arrivals;
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");
        
        output = null;
      }
    );
    return output;
  },
  
  
  /**
   * Station class
   */
  Station: function(){
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
    
  },
  
  
  /**
   * Bus arrival at a station
   */
  Arrival: function(){
    this.bus = DeLijn.Bus();
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
  },
  
  /**
   * Bus
   */
  Bus: function(){
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
};

var station = DeLijn.getStation(300812);
var arrivals = DeLijn.getArrivals(station,10);
arrivals.forEach(function(arrival) {
    console.log(arrival.getBus().getNumber() + " [" + arrival.getBus().getName() + "]   @ "  + arrival.getTime().toLocaleTimeString());  
});

var main = new UI.Card({
  title: 'BETransport',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Test'
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: ''
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window();
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Test',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});