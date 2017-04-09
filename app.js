

// 1. Initialize Firebase
var config = {
    apiKey: "AIzaSyAOIST86oJEJtCmyPTSMMgXnECNZbpnasw",
    authDomain: "train-time-5a721.firebaseapp.com",
    databaseURL: "https://train-time-5a721.firebaseio.com",
    projectId: "train-time-5a721",
    storageBucket: "train-time-5a721.appspot.com",
    messagingSenderId: "104146219656"
  };
  firebase.initializeApp(config);

  // The following code lines to make sure that the new train form is completly filled before enabled submit button
    $("#add-new-train-btn").attr("disabled", "disabled");

    $("input").keyup(function() {
      if ($("#train-name-input").val() != "" && $("#destination-input").val() != "" 
       && $("#first-train-time-input").val() != "" && $("#frequency-input").val() != ""
       )
      {
        $("#add-new-train-btn").removeAttr("disabled");
      }
    })


var database = firebase.database();

// 2. Button for adding new trains
$("#add-new-train-btn").on("click", function(event) {
  event.preventDefault();


  // Grabs train input
  var trainName = $("#train-name-input").val().trim();
  var destination = $("#destination-input").val().trim();
  var firstTrainTime = $("#first-train-time-input").val().trim();
  var frequency = $("#frequency-input").val().trim();
  var firstTimeToString = firstTrainTime.toString();
  var lastTwoDigits = firstTimeToString.charAt(2) + firstTimeToString.charAt(2);

  
  // The below line to make sure that the user enter the right millitary format before push it to Firebase.
  if ( firstTrainTime.length === 4 && firstTrainTime < 2359 && firstTrainTime > 0 && frequency > 0 && lastTwoDigits >=0 && lastTwoDigits <= 59) {

    //convert Millitary time to Loacal Time
     firstTrainTime = firstTimeToString.charAt(0) + firstTimeToString.charAt(1) + ":" + firstTimeToString.charAt(2) + firstTimeToString.charAt(3);
     firstTrainTime = moment(firstTrainTime, "hh:mm").format("LT");

     

  //Creates local object for holding train data
  var newTrain = {
    nameOfTrain: trainName,
    trainDestination: destination,
    timeOfFirstTrain: firstTrainTime,
    timeBetweenTrains: frequency // time here is in minutes
  };

  // Uploads train data to the database
  database.ref().push(newTrain);
}
else {
  alert ("First Train Time has to be in millitary format and frequency needs to be greater than zero");
}

  // Clears all of the text-boxes
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#first-train-time-input").val("");
  $("#frequency-input").val("");

  //Disable submit button
  $("#add-new-train-btn").attr("disabled", "disabled");

  // Prevents moving to new page
  return false;
}); 



// 3. Create Firebase event for adding train to a row in the html when a user adds an entry
// We are reading from firebase
database.ref().on("child_added", function(childSnapshot) {

  // Store everything into variables.
  var trainName = childSnapshot.val().nameOfTrain;
  var destination = childSnapshot.val().trainDestination;
  var firstTrainTime = childSnapshot.val().timeOfFirstTrain;
  var frequency = childSnapshot.val().timeBetweenTrains;

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTrainTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "months");

  // Current Time
  var currentTime = moment();

  // Difference between the times
  var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");

  // Time apart (remainder)
  var tRemainder = diffTime % frequency;

  // Minute Until Train Arrives
  var minutesAway = frequency - tRemainder;

  // Next Train
  var nextTrain = moment().add(minutesAway, "minutes");

  // Add each train's data into the table
  $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + destination + "</td><td>" +
  frequency + "</td><td>" + moment(nextTrain).format("LT") + "</td><td>" + minutesAway +  "</td></tr>");
});

// when this function is called the HTML page will reload
function autoRefresh() {
  window.location.reload();
}

// Calling autoRefesh function every one minute
//setInterval('autoRefresh()', 60000);