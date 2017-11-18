 //Calls getWeather() when document is ready
 $( window ).on( "load", function(){

  getWeather(); 
  calendarDate();
  startTime();

 });


//Google 0Auth
//=========================

// Client ID and API key from the Developer Console
var CLIENT_ID = '908655633390-bipca08v5p9tkot7cjul1pgtcbd4ts10.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCcz_rY6GhH9tTnejrKQgbxXu7y8CM2Fjg';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('signin-button');
var signoutButton = document.getElementById('signout-button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listUpcomingEvents();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

//Time Manipulation
//=========================

//Creates a javascript date for todays date. May be incremented/decremented
var d = new Date ();

//Allows us to increment/decrement day
var dateOffset = 0;

//Array to store days of the week text value. Index 0 is Sunday. This is the javascript date convention
var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//Array to store month text value. Index 0 is Sunday. This is the javascript date convention
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

//Writes d to #calendar-date formatted as: Day  ,  Date
function calendarDate() {
  //Need to be able to handle when dateOffset > than weekDays array 
  //calendarDateOffset = dateOffset;
  $("#calendar-date").empty();
  $("#calendar-date").append( (weekDays[d.getUTCDay() + dateOffset]) + " , " + (months[d.getUTCMonth()]) + " " + (d.getUTCDate() + dateOffset) );
}

//UTC date
// var currentDateUTC = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
// console.log("UTC" + currentDateUTC);

// Converts current date to midnight
//var timeMin = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours());
//console.log("Time Min" + timeMin);
var googleTimeMin = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T00:00:00.000Z'

//Converts current date to 11:59:59:999 pm
//var timeMax = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999);
//console.log("Time Max" + timeMax);
//2017-11-16T04:00:00.000Z toISOSString format
var googleTimeMax = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T23:59:59.999Z'

console.log("Min: " + googleTimeMin + ", Max: " + googleTimeMax);

//Adds one to dateOffset, then calls calendarDate() & listUpcomingEvents()
function incrementDate() {
  dateOffset ++;
  googleTimeMin = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T00:00:00.000Z';
  googleTimeMax = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T23:59:59.999Z';
  calendarDate();
  listUpcomingEvents();

}

//Substracts one to dateOffset, then calls calendarDate() & listUpcomingEvents()
function decrementDate() {
  dateOffset --;
  googleTimeMin = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T00:00:00.000Z';
  googleTimeMax = d.getUTCFullYear() + '-' + (d.getUTCMonth() +1 ) + "-" + (d.getUTCDate() + dateOffset) + 'T23:59:59.999Z';
  calendarDate();
  listUpcomingEvents();

}

//API Calls
//=========================

//Event List
//=========================

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    //'timeMin': (new Date()).toISOString(),
    'timeMin': googleTimeMin,
    'timeMax' : googleTimeMax,
    'showDeleted': false,
    'singleEvents': true,
    'orderBy': 'startTime'
  }).then(function(response) {
    console.log(response);
    console.log(response.results);
    var events = response.result.items;
    console.log(events);

    //Example Code
    // if (events.length > 0) {
    //   for (i = 0; i < events.length; i++) {
    //     var event = events[i];
    //     var when = event.start.dateTime;
    //     if (!when) {
    //       when = event.start.date;
    //     }
    //     console.log(event.summary + ' (' + when + ')')
    //   }
    // } else {
    //   console.log('No upcoming events found.');
    // }

    //Clears out event-container on sign in
    $("#event-container").empty();

    if (events.length > 0) {
      for (i = 0; i < events.length; i++) {
        var event = events[i];
        var when = event.start.dateTime;
        //
        var d = new Date(when).getHours();
        var m = new Date(when).getMinutes();

        if (m < 10) {
          m = "0" + m;
        }

        console.log(d);
        if (!when) {
          when = event.start.date;
        }

        //Stores event[i].when, event.[i].summmary, event[i].id in var writeEvent
        var writeEvent = $(

          '<div class="event" data-eventid='+ event.id + '> <div class="event-header"> <i class="fa fa-pencil" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Edit Event"></i></div><div>' + d + ":" + m + '&nbsp&nbsp|&nbsp&nbsp' + event.summary + '</div><div>'

          );

        //Appends content of writeEvent and summary to generated divs
        $("#event-container").append(writeEvent);      
      }
    } else {

       //Appends 'No upcoming events found.' to #event-container if there are no upcoming events
      $("#event-container").append('No upcoming events found.');
    }

  });
}

//Weather
//https://home.openweathermap.org
//=========================

var ApiKeyOWM = "079b3bb7acbb509e98d70fdbdb2f77fd";

//api.openweathermap.org/data/2.5/weather?q={city name},{country code}
//api.openweathermap.org/data/2.5/weather?q=Raleigh,US&APPID=079b3bb7acbb509e98d70fdbdb2f77fd
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=Raleigh,US" + "&APPID=" +  ApiKeyOWM;
console.log(queryURL);

//Stores OWM call information
// var weatherObject = ;

function getWeather() {
  console.log("inside getWeather");

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log(response);
    console.log(response.weather[0].icon);
    console.log(response.main.temp);

    var imgDiv = "<img src='" + "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png'" + ">";
    console.log(imgDiv);
    $("#weather-icon").empty();
    $("#weather-icon").append(imgDiv);
    $("#temp").empty();
    //Converts from Kelvin to F
    $("#temp").append((((9/5) * (response.main.temp - 273)) + 32).toPrecision(2) + "  F");
   
  });
}

//Time
//=========================

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);

    $("#clock").text(h + ":" + m + ":" + s);
    var t = setTimeout(startTime, 500);  //whatever this is, the clock stops without it.
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}