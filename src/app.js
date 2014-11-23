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
 * @version 1.1.0
 * @author Maxim Van de Wynckel
 */

// Pebble Imports
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');
  
// Screens
var screen_menu = null;
var screen_delijn = null;
var screen_delijn_arrivals = null;
var screen_mivb = null;
var screen_mivb_arrivals = null;
var screen_nmbs = null;
var screen_nmbs_arrivals = null;
var screen_load = null;
var screen_error = null;


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
        try{
          // Parse JSON data
          console.log("Station fetched from url '" + url + "'");
          
          var stations = data.Stations;
          
          var station = new DeLijn.Station();
          station.setId(stations[0].id);
          station.setCode(stations[0].code);
          station.setName(stations[0].name);
          console.log("Station: " + station.getName() + " [" + station.getId() + "]");
          delijn_onStationLoaded(station); 
        }catch (err){
          hideLoading();
          showError();
        }
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get station from url '" + url + "' !");
        hideLoading();
        showError();
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
        try{
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
        }catch (err){
          hideLoading();
          showError();
        }
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");
        hideLoading();
        showError();
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
        hideLoading();
        showError();
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
        hideLoading();
        showError();
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
  getStation: function(name){
    var station = new NMBS.Station();
    station.setName(name);
    nmbs_onStationLoaded(station);
  },
  
  /**
   * Get arrivals in station
   *
   * @param station Station
   * @param count Max count
   * @return Array with Arrivals
   */
  getDepartures: function(station,count){
    var d = new Date();
    var url = "https://data.irail.be/NMBS/Departures/" + station.getName() + "/" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getHours() + "/" + d.getMinutes() + ".json?rowcount=" + count;
    // Get the arrivals from the URL
    ajax({
      url: url,
      type: 'json'
      },
      function(data) {
        try{
          // Parse JSON data
          console.log("Arrivals fetched from url '" + url + "'");
          
          var arrivals = [];
          console.log("Found '" + data.Departures.departures.length + "' arrivals!");
          if (data.Departures.departures.length < count){
            count = data.Departures.departures.length;
          }
          for (var i = 0; i < count; i++) {
            var arrival = new NMBS.Arrival();
            arrival.setTime(new Date(data.Departures.departures[i].time * 1000));
            arrival.setDelay(data.Departures.departures[i].delay * 1000);
            arrival.setDirection(data.Departures.departures[i].direction);
            arrival.setPlatform(data.Departures.departures[i].platform.name);
            var trainId = data.Departures.departures[i].vehicle.replace(/BE.NMBS./g,"");
            var train = new NMBS.Train();
            train.setId(trainId);
            arrival.setTrain(train);
            arrivals.push(arrival);
          }
          nmbs_onArrivalsLoaded(station,arrivals);
        }catch (err){
          hideLoading();
          showError();
        }
      },
      function(error) {
        // Error while contacting irail
        console.log("Unable to get arrivals from url '" + url + "' !");
        hideLoading();
        showError();
       
      }
    );
  },
  
  getVehicle: function(trainId){
    var d = new Date();
    var url = "https://data.irail.be/NMBS/Vehicle/" + trainId + "/" + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getHours() + "/" + d.getMinutes() + ".json";
    // Get the arrivals from the URL
    ajax({
      url: url,
      type: 'json'
    },
         function(data) {
           try{
             // Parse JSON data
             console.log("Vehicle fetched from url '" + url + "'");
             var train = new NMBS.Train();
             train.setId(trainId);
             console.log("Vehicle stops: " + data.Vehicle.stops.length);
             var trainStops = [];
             for (var i in data.Vehicle.stops){
               var stop = new NMBS.TrainStop();
               var stopStation = new NMBS.Station();
               stopStation.setName(data.Vehicle.stops[i].station.name);
               stop.setStation(stopStation);
               trainStops.push(stop);
             }
             train.setStops(trainStops);
             train.setName(data.Vehicle.stops[0].station.name + " - " + data.Vehicle.stops[data.Vehicle.stops.length - 1].station.name);
             nmbs_onTrainLoaded(train);
           }catch (err){
             hideLoading();
             showError();
           }
         },
         function(error) {
           // Error while contacting irail
           console.log("Unable to get vehicle from url '" + url + "' !");
           hideLoading();
           showError();

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
    this.direction = "";
    this.delay = 0;
    
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
    this.getDirection = function(){
      return this.direction;
    };
    this.setDirection = function(direction){
      this.direction = direction;
    };
    this.getDelay = function(){
      return this.delay;
    };
    this.setDelay = function(delay){
      this.delay = delay;
    };
  },
  
  /**
   * Train
   */
  Train: function(){
    this.id = "";
    this.name = "";
    this.stops = [];
    
    this.getId = function() {
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
    this.getStops = function() {
      return this.stops;
    };
    this.setStops = function(stops){
      this.stops = stops;
    };
  },
  
  /**
   * Train stops
   */
  TrainStop: function(){
    this.station = NMBS.Station();
    
    this.getStation = function(){
      return this.station;
    };
    this.setStation = function(station){
      this.station = station;
    };
  }
};

// OPTIONS
var options = {
  delijnHaltes: [

  ],
  mivbHaltes: [
    
  ],
  nmbsHaltes: [

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
  // This message is displayed in the title of a menu
  // that shows all bus stops.
  transport_stops_title: {
    en: 'Your stops',
    nl: 'Uw haltes',
    fr: 'Vos arrêts de bus'
  },
  // This message is displayed in the title of a menu
  // that shows all train stations.
  transport_stations_title: {
    en: 'Your stations',
    nl: 'Uw stations',
    fr: 'Vos gares'
  },
  // This message is displayed to show that there
  // are no arrivals in the near future.
  transport_noarrivals: {
    en: 'None',
    nl: 'Geen',
    fr: 'Aucun'
  },
  // This is the loading screen
  loading_screen: {
    en: 'Loading ...',
    nl: 'Bezig met laden ...',
    fr: 'Chargement ...'
  },
  // This is the error screen
  error_screen: {
    en: 'Error while getting data!',
    nl: 'Fout bij het ophalen!',
    fr: 'Erreur lors de l\'obtention de données!'
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


// DeLijn Stops and Arrivals cached
var delijn_haltes = [];
var delijn_arrivals = [];

// MIVB Stops and Arrivals cached
var mivbstib_haltes = [];
var mivbstib_arrivals = [];

// NMBS Stops and Arrivals cached
var nmbs_haltes = [];
var nmbs_arrivals = [];

function nmbs_onStationLoaded(station){
  NMBS.getDepartures(station,10);
}

function nmbs_onArrivalsLoaded(station,arrivals){
  nmbs_haltes.unshift(station);
  nmbs_arrivals.unshift(arrivals);
  console.log("Arrivals loaded NMBS for " + station.getName() + "  [" + arrivals.length + "]");
  if (nmbs_haltes.length == options.nmbsHaltes.length){
    var nmbs_menu = [];
    for (var i in nmbs_haltes){
      var trainStr = getMessage(messages.transport_noarrivals);
      if (nmbs_arrivals[i].length !== 0){
        trainStr = nmbs_arrivals[i][0].getTrain().getId() + " " + nmbs_arrivals[i][0].getDirection();
      }
      nmbs_menu.push({
        title: nmbs_haltes[i].getName(),
        subtitle: trainStr
      });
    }
    screen_nmbs = new UI.Menu({
      sections: [{
        title: getMessage(messages.transport_nmbs) + ' - ' + getMessage(messages.transport_stations_title),
        items: nmbs_menu
      }]
    });
    screen_nmbs.on('select', function(e) {
      var id = e.itemIndex;
  
      var arrivals_menu = [];
      for (var i in nmbs_arrivals[id]){
        var arrival = nmbs_arrivals[id][i];
        var curTime = new Date(); 
        var arrivalTime = new Date(arrival.getTime() + (arrival.getDelay() * 1000));
        var arrivalTimeStr = arrivalTime.toLocaleTimeString();
        console.log('Time remaining for: ' + arrival.getTrain().getId() + '  =  ' + (arrivalTime.getTime() - curTime.getTime()));
        console.log('Current time: ' + curTime.getTime());
        console.log('Arrival time: ' + arrivalTime.getTime());
        if (arrivalTime.getTime() - curTime.getTime() < 3600000){
          arrivalTimeStr = Math.round(((arrivalTime.getTime()-curTime.getTime()) / 60000)) + " min";
        }
        arrivals_menu.push({
          title: arrival.getTrain().getId() + "  " + arrivalTimeStr,
          subtitle: "[" + arrival.getPlatform() + "] " + arrival.getDirection()
        });
      }
  
      screen_nmbs_arrivals = new UI.Menu({
        sections: [{
          title: nmbs_haltes[id].getName(),
          items: arrivals_menu
        }]
      });
      screen_nmbs_arrivals.on('select', function(e) {
        var arrivalId = e.itemIndex;
        var arrival = nmbs_arrivals[id][arrivalId];
        showLoading();
        NMBS.getVehicle(arrival.getTrain().getId());
      });
      screen_nmbs_arrivals.show();
    });
    Accel.init();
    screen_nmbs.on('accelTap', function(e) {
      screen_nmbs.hide();
      load_nmbs();
    });
    console.log("Hiding load screen [NMBS]");
    hideLoading();
    screen_nmbs.show(); 
  }
}

function nmbs_onTrainLoaded(train){
  hideLoading();
  var content = "";
  for (var stopId in train.getStops()){
    var stop = train.getStops()[stopId];
    content += stop.getStation().getName();
    
    content += "\n\n";
  }
  var stationDetail = new UI.Card({
    title: train.getId(),
    body: content,
    scrollable: true
  });
  stationDetail.show();
}

function mivbstib_onStationLoaded(station){
  MIVB.getArrivals(station,10);
}

function mivbstib_onArrivalsLoaded(station,arrivals){
  
}

function delijn_onStationLoaded(station){
  DeLijn.getArrivals(station,10);
}

function delijn_onArrivalsLoaded(station,arrivals){
  var busStr = getMessage(messages.transport_noarrivals);
  if (arrivals.length !== 0){
    busStr = arrivals[0].getBus().getNumber() + " " + arrivals[0].getBus().getName();
  }
  delijn_haltes.push({
    title: station.getName(),
    subtitle: busStr
  });
  delijn_arrivals.push(arrivals);
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
          var curTime = new Date(); 
          var arrivalTime = arrival.getTime();
          var arrivalTimeStr = arrivalTime.toLocaleTimeString();
          console.log('Time remaining for: ' + arrival.getBus().getNumber() + '  =  ' + (arrivalTime.getTime() - curTime.getTime()));
          console.log('Current time: ' + curTime.getTime());
          console.log('Arrival time: ' + arrivalTime.getTime());
          if (arrivalTime.getTime() - curTime.getTime() < 3600000){
            arrivalTimeStr = Math.round(((arrivalTime.getTime()-curTime.getTime()) / 60000)) + " min";
          }
          arrivals_menu.push({
            title: arrival.getBus().getNumber() + "  -  " +  arrivalTimeStr,
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
      Accel.init();
      screen_delijn.on('accelTap', function(e) {
        screen_delijn.hide();
        load_delijn();
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
    Pebble.openURL('http://pebble.mvdw-software.be/BETransport/settings_1.html?'+encodeURIComponent(JSON.stringify(options)));
});

Pebble.addEventListener("webviewclosed", function(e) {
    if (e.response != 'undefined' && e.response !== "") {
        localStorage.setItem("options", e.response);
        Vibe.vibrate('short');
        load_app();
    }
});

function resetConfig(){
  options = [];
  options.delijnHaltes = [];
  options.mivbHaltes = [];
  options.nmbsHaltes = [];
  options.language = 'nl';
}

function load_app(){
  if (localStorage.getItem("options") === null) {
    console.log("No options in Localstorage");
    resetConfig();
  } else {
    try {
      console.log("Get options from Localstorage");
      console.log(localStorage.getItem("options"));
      options = JSON.parse(decodeURIComponent(localStorage.getItem("options")));
      options.delijnHaltes = options.delijnHaltes.split("\n");
      options.mivbHaltes = options.mivbHaltes.split("\n");
      options.nmbsHaltes = options.nmbsHaltes.split("\n");
      console.log("Options = " + JSON.stringify(options));
    } catch (err){
      resetConfig();
    }
  }
  
  try{ hideError(); }catch (err){}
  try{ hideLoading(); }catch (err){}
  try{ screen_menu.hide(); }catch (err){}
  try{ screen_delijn.hide(); }catch (err){}
  try{ screen_delijn_arrivals.hide(); }catch (err){}
  try{ screen_mivb.hide(); }catch (err){}
  try{ screen_mivb_arrivals.hide(); }catch (err){}
  try{ screen_nmbs.hide(); }catch (err){}
  try{ screen_nmbs_arrivals.hide(); }catch (err){}
  
  initLoadingScreen();
  initErrorScreen();
  
  screen_menu = new UI.Menu({
    sections: [{
      title: 'BETransport',
      items: [{
        title: getMessage(messages.transport_delijn),
        icon: 'images/icon_delijn.png'
//       },{
//         title: getMessage(messages.transport_mivb),
//         icon: 'images/icon_mivbstib.png'
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
      case 1:
        load_nmbs();
        break;
    }
  });
  screen_menu.show(); 
}
load_app();

function load_delijn(){
  showLoading();
  delijn_haltes = [];
  delijn_arrivals = [];
  for (var halte in options.delijnHaltes){
    DeLijn.getStation(options.delijnHaltes[halte]);
  }
  if (options.delijnHaltes.length === 0){
    // Hide
    Vibe.vibrate('short');
    hideLoading();
  }
}

function load_nmbs(){
  showLoading();
  nmbs_haltes = [];
  nmbs_arrivals = [];
  for (var halte in options.nmbsHaltes){
    NMBS.getStation(options.nmbsHaltes[halte]);
  }
  if (options.nmbsHaltes.length === 0){
    // Hide
    Vibe.vibrate('short');
    hideLoading();
  }
}



function initLoadingScreen(){
  screen_load = new UI.Window();
  var text_load = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: getMessage(messages.loading_screen),
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });
  screen_load.add(text_load);
}

function showLoading(){
  screen_load.show();
}

function hideLoading(){
  screen_load.hide();
}


function initErrorScreen(){
  screen_error = new UI.Window();
  var text_error = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: getMessage(messages.error_screen),
    font: 'GOTHIC_28_BOLD',
    color: 'black',
    textOverflow: 'wrap',
    textAlign: 'center',
    backgroundColor: 'white'
  });
  screen_error.add(text_error);
}

function showError(){
  screen_error.show();
}

function hideError(){
  screen_error.hide();
}