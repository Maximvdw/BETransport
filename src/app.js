/**
 * BETransport
 *
 * This Pebble application made to stay up to date
 * with the Belgian public transport supports
 * DeLijn, MIVB/STIB and NMBS
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
    
    // Get the stations from the URL
    ajax({
      url: url,
      type: 'json',
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
        delijn_onStationLoaded(station);
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get station from url '" + url + "' !");
        
      }
    );
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
    // Get the arrivals from the URL
    ajax({
      url: url,
      type: 'json'
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
        
        delijn_onArrivalsLoaded(station,arrivals);
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");
        
      }
    );
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

/**
 * MIVBAPI
 *
 * @version 1.0
 * @author Maxim Van de Wynckel
 */
var MIVB = {  
  /**
   * Get station info
   *
   * @param id Station identifier
   * @return Parsed JSON array
   */
  getStation: function(id){
    var url = "http://data.irail.be/MIVBSTIB/Stations.json?id=" + id;

    // Get the stations from the URL
    ajax({
      url: url,
      type: 'json'
      },
      function(data) {
        // Parse JSON data
        console.log("Station fetched from url '" + url + "'");
        
        var stations = data.Stations;
        
        var station = new MIVB.Station();
        station.setId(stations[0].id);
        station.setName(stations[0].name);
        console.log("Station: " + station.getName() + " [" + station.getId() + "]");

        mivbstib_onStationLoaded(station);
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get station from url '" + url + "' !");

      }
    );
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
    var url = "https://data.irail.be/MIVBSTIB/Departures/" + station.getId() + "/" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getHours() + "/" + d.getMinutes() + ".json?rowcount=" + count;
    // Get the arrivals from the URL
    ajax({
      url: url,
      type: 'json'
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
        
        mivbstib_onArrivalsLoaded(station,arrivals);
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");

      }
    );
  },
  
  
  /**
   * Station class
   */
  Station: function(){
    this.id = 0;
    this.name = "";
    
    this.getId = function(){
      return this.id;
    };
    this.setId = function(id){
      this.id = id;
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

/**
 * NMBSAPI
 *
 * @version 1.0
 * @author Maxim Van de Wynckel
 */
var NMBS = {  
  /**
   * Get station info
   *
   * @param id Station identifier
   * @return Parsed JSON array
   */
  getStation: function(id){
    var url = "http://data.irail.be/NMBS/Stations.json?id=" + id;
    
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
        
        var station = new MIVB.Station();
        station.setId(stations[0].id);
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
    var url = "https://data.irail.be/NMBS/Liveboard/" + station.getId() + "/" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getHours() + "/" + d.getMinutes() + ".json?rowcount=" + count;
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
        
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");
        
       
      }
    );
  },
  
  
  /**
   * Station class
   */
  Station: function(){
    this.id = 0;
    this.name = "";
    
    this.getId = function(){
      return this.id;
    };
    this.setId = function(id){
      this.id = id;
    };
    this.getName = function() {
          return this.name;
    };
    this.setName = function(name){
      this.name = name;
    };
    
  },
  
  
  /**
   * Train arrival at a station
   */
  Arrival: function(){
    this.train = NMBS.Train();
    this.time = Date();
    this.platform = 0;
    
    this.getTrain = function(){
      return this.train;
    };
    this.setTrain = function(train){
      this.train = train;
    };
    this.getTime = function(){
      return this.time;
    };
    this.setTime = function(time){
      this.time = time;
    };
    this.getPlatform = function(){
      return this.platform;
    };
    this.setPlatform = function(platform){
      this.platform = platform;
    };
  },
  
  /**
   * Train
   */
  Train: function(){
    this.vehicle = 0;
    this.name = "";
    
    this.getName = function() {
          return this.name;
    };
    this.setName = function(name){
      this.name = name;
    };
    this.getVehicle = function(){
      return this.vehicle;
    };
    this.setVehicle = function(vehicle){
      this.vehicle = vehicle;
    };
  }
};

// OPTIONS
var options = {
  delijnHaltes: [
    300812,
    301748,
    301766
  ],
  mivbHaltes: [
    
  ],
  nmbsStops: [
    
  ],
  language: 'nl'
};

/**
 * All app messages in multiple languages
 */
var messages = {
  transport_delijn: {
    en: 'DeLijn',
    nl: 'DeLijn',
    fr: 'DeLijn'
  },
  transport_mivb: {
    en: 'MIVB / STIB',
    nl: 'MIVB / STIB',
    fr: 'MIVB / STIB'
  },
  transport_nmbs: {
    en: 'NMBS',
    nl: 'NMBS',
    fr: 'NMBS'
  },
  transport_stops_title: {
    en: 'Your stops',
    nl: 'Uw haltes',
    fr: 'Your stops'
  },
  loading_screen: {
    en: 'Loading ...',
    nl: 'Bezig met laden ...',
    fr: 'Loading ...'
  }
};

function getMessage(message){
  switch (options.language){
    case 'nl':
      return message.nl;
    case 'en':
      return message.en;
    case 'fr':
      return message.fr;
  }
  return '';
}


var delijn_haltes = [];
var delijn_arrivals = [];
var mivbstib_haltes = [];

function mivbstib_onStationLoaded(station){
  MIVB.getArrivals(station,10);
}

function mivbstib_onArrivalsLoaded(station,arrivals){
  
}

function delijn_onStationLoaded(station){
  DeLijn.getArrivals(station,10);
}

function delijn_onArrivalsLoaded(station,arrivals){
  var busStr = "None";
  if (arrivals.length !== 0){
    busStr = arrivals[0].getBus().getNumber() + " " + arrivals[0].getBus().getName();
  }
  delijn_haltes.unshift({
    title: station.getName(),
    subtitle: busStr
  });
  delijn_arrivals.unshift(arrivals);
  if (delijn_haltes.length == options.delijnHaltes.length){
      screen_delijn = new UI.Menu({
        sections: [{
          title: getMessage(messages.transport_delijn) + ' - ' + getMessage(messages.transport_stops_title),
          items: delijn_haltes
        }]
      });
      screen_delijn.on('select', function(e) {
        var id = e.itemIndex;
        
        var arrivals_menu = [];
        for (var i in delijn_arrivals[id]){
          var arrival = delijn_arrivals[id][i];
          arrivals_menu.push({
            title: arrival.getBus().getNumber() + "  -  " + arrival.getTime().toLocaleTimeString(),
            subtitle: arrival.getBus().getName()
          });
        }
        
        screen_delijn_arrivals = new UI.Menu({
          sections: [{
            title: delijn_haltes[id].title,
            items: arrivals_menu
          }]
        });
        screen_delijn_arrivals.show();
      });
      console.log("Hiding load screen [DeLijn]");
      hideLoading();
      screen_delijn.show(); 
  }
}

var initialized = false;

/**
 * On Pebble Initialized Event
 */
Pebble.addEventListener("ready", function() {
    initialized = true;
});

Pebble.addEventListener("showConfiguration", function() {
    Pebble.openURL('http://runelaenen.be/api/MijnLijnPebbleConfig.php?'+encodeURIComponent(JSON.stringify(options)));
});

Pebble.addEventListener("webviewclosed", function(e) {
    if (e.response != 'undefined' && e.response !== "") {
        localStorage.setItem("options", e.response);
    }
});

// Screens
var screen_menu = null;
var screen_delijn = null;
var screen_delijn_arrivals = null;
var screen_mivb = null;
var screen_mivb_arrivals = null;
var screen_load = null;

function load_menu(){

  screen_menu = new UI.Menu({
    sections: [{
      title: 'BETransport',
      items: [{
        title: getMessage(messages.transport_delijn),
        icon: 'images/icon_delijn.png'
      },{
        title: getMessage(messages.transport_mivb),
        icon: 'images/icon_mivbstib.png'
      },{
        title: getMessage(messages.transport_nmbs),
        icon: 'images/icon_nmbs.png'
      }]
    }]
  });
  screen_menu.on('select', function(e) {
    console.log("Menu selection : " + e.itemIndex);
    switch(e.itemIndex){
      case 0:
        load_delijn();
        break;
    }
  });
  screen_menu.show(); 
}
load_menu();

function load_delijn(){
  showLoading();
  delijn_haltes = [];
  delijn_arrivals = [];
  for (var halte in options.delijnHaltes){
    DeLijn.getStation(options.delijnHaltes[halte]);
  }
}


screen_load = new UI.Window();
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text: getMessage(messages.loading_screen),
  font: 'GOTHIC_28_BOLD',
  color: 'black',
  textOverflow: 'wrap',
  textAlign: 'center',
  backgroundColor: 'white'
});
screen_load.add(text);

function showLoading(){
  screen_load.show();
}

function hideLoading(){
  screen_load.hide();
}