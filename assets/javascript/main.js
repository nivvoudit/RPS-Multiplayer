var database = firebase.database();
var p1Pick = "";
var p2Pick = "";
var p1Name = "";
var p2Name = "";
var numPlayers = 0;
var playerNum = 0;
var playerName = "";
var connectionKey;
var p1Wins = 0;
var p1Losses = 0;
var p2Wins = 0;
var p2Losses = 0;
var turn;
var setTurn = database.ref().child('turn');

//starts the game for each player
$("#start").on('click', function() {

  //checks if two users are already playing
  if (numPlayers < 2) {
    if (p2Name != "") {
      playerNum = 1;
    }
    else {
      playerNum = numPlayers + 1;
    }
    player = database.ref('/players').child(playerNum);
    playerName = $("#userName").val().trim();

    //displays the correct player's buttons
    $('#p' + playerNum + "Buttons").css('visibility', 'visible');
    database.ref('/chat').set({message: playerName + ' has connected.'});

    player.set({
      name: playerName,
      wins: '0',
      losses: '0'
    });

    $("#p" + playerNum + "WL").html("Wins: 0, Losses: 0");
  }
  else {
    alert("Two players are already playing!");
  }

  if (numPlayers == 2) {
    turn = 1;
    setTurn.set(turn);
  }

  $("#userName").val("");

  return false;
});

//runs anytime the database is updated
database.ref().on("value", function(snapshot) {
  numPlayers = snapshot.child("players").numChildren();
  var p1Snap = snapshot.child("players").child('1');
  var p2Snap = snapshot.child("players").child('2');

  var player1Snap = p1Snap.child('name');
  var player2Snap = p2Snap.child('name');

  //once the player's names are in the database, store them locally
  if (player1Snap.exists()) {
    p1Name = p1Snap.val().name;
    $("#player1Name").html(p1Name);
  }
  else {
    $("#player1Name").html("Waiting for Player 1");
  }

  if (player2Snap.exists()) {
    p2Name = p2Snap.val().name;
    $("#player2Name").html(p2Name);
  }
  else {
    $("#player2Name").html("Waiting for Player 2");
  }

  var pick1Snap = p1Snap.child('pick');
  var pick2Snap = p2Snap.child('pick');

  //once the player's picks are in the database, store them locally
  if (pick1Snap.exists()) {
    p1Pick = p1Snap.val().pick;
  }

  if (pick2Snap.exists()) {
    p2Pick = p2Snap.val().pick;
  }

  //once both players have picked, compare the picks and determine the winner
  if (pick1Snap.exists() && pick2Snap.exists()) {
    comparePicks();
  }

  var wins1Snap = p1Snap.child('wins');
  var losses1Snap = p1Snap.child('losses');
  var wins2Snap = p2Snap.child('wins');
  var losses2Snap = p2Snap.child('losses');

  if (wins1Snap.exists() && losses1Snap.exists()) {
    $('#p1WL').html("Wins: " + p1Snap.val().wins + ", Losses: " + p1Snap.val().losses);
  }
  else {
    $('#p1WL').empty();
  }
  if (wins2Snap.exists() && losses2Snap.exists()) {
    $('#p2WL').html("Wins: " + p2Snap.val().wins + ", Losses: " + p2Snap.val().losses);
  }
  else {
    $('#p2WL').empty();
  }

  var turnSnap = snapshot.child("turn");

  //adjusts the border color of the player boxes depending on the turn
  if (turnSnap.exists()) {
    turn = snapshot.child("turn").val();
    if (turn == 1) {
      $('#side1').css("border", "1px solid yellow");
      $('#side2').css("border", "1px solid black");
    }
    else if (turn == 2) {
      $('#side1').css("border", "1px solid black");
      $('#side2').css("border", "1px solid yellow");
    }
  }

  if (numPlayers <= 1) {
    $('#side1').css("border", "1px solid black");
    $('#side2').css("border", "1px solid black");
  }

  }, function (errorObject) {
    //
      console.log("The read failed: " + errorObject.code);
});

var chatRef = database.ref("/chat");

//updates both players' chat boxes with the latest message
chatRef.on("value", function(snap) {
  if (snap.val()) {
    var msg = $('<p>' + snap.val().message + '</p>');
    if (playerNum > 0) {
      $("#chatbox").append(msg);
    }

    //once chatbox overflows, animate to the new bottom of the div
    $("#chatbox").animate({scrollTop: $("#chatbox").get(0).scrollHeight}, 400);
  }
});

//when any of the player 1 buttons get clicked
$(".optionsP1").on('click', function() {
  if (turn == 1) {
    p1Pick = $(this).data('pick');
    var pick = database.ref('/players').child('1');
    pick.update({pick: p1Pick});
    turn = 2;
    setTurn.set(turn);
  }
  else {
    alert("It is not your turn!");
  }
});

//when any of the player 2 buttons get clicked
$(".optionsP2").on('click', function() {
  if (turn == 2) {
    p2Pick = $(this).data('pick');
    var pick = database.ref('/players').child('2');
    pick.update({pick: p2Pick});
    turn = 1;
    setTurn.set(turn);
  }
  else {
    alert("It is not your turn!");
  }
});

//determine a winner
function comparePicks() {
  if (p1Pick == p2Pick) {
    $("#playerWin").html('Tie');
  }
  else if (p1Pick == 'paper' && p2Pick == 'scissors') {
    $("#playerWin").html(p2Name + ' wins!');
    p2Wins++;
    p1Losses++;
  }
  else if (p1Pick == 'scissors' && p2Pick == 'paper') {
    $("#playerWin").html(p1Name + ' wins!');
    p1Wins++;
    p2Losses++;
  }
  else if (p1Pick == 'paper' && p2Pick == 'rock') {
    $("#playerWin").html(p1Name + ' wins!');
    p1Wins++;
    p2Losses++;
  }
  else if (p1Pick == 'rock' && p2Pick == 'paper') {
    $("#playerWin").html(p2Name + ' wins!');
    p2Wins++;
    p1Losses++;
  }
  else if (p1Pick == 'rock' && p2Pick == 'scissors') {
    $("#playerWin").html(p1Name + ' wins!');
    p1Wins++;
    p2Losses++;
  }
  else if (p1Pick == 'scissors' && p2Pick == 'rock') {
    $("#playerWin").html(p2Name + ' wins!');
    p2Wins++;
    p1Losses++;
  }
  setTimeout(function() {$("#playerWin").empty()}, 2000);
  updateWinsAndLosses();
}

//after each round, update the win count of each player
function updateWinsAndLosses() {
  var p1Upd = database.ref('/players').child('1');
  p1Pick = "";
  p1Upd.child('pick').remove();

  p1Upd.update({
    wins: p1Wins,
    losses: p1Losses
  });

  var p2Upd = database.ref('/players').child('2');
  p2Pick = "";
  p2Upd.child('pick').remove();

  p2Upd.update({
    wins: p2Wins,
    losses: p2Losses
  });


}

//when the last player closes their tab, clear the players info from the database
window.addEventListener("beforeunload", function (e) {
  database.ref('/players').child(playerNum).remove();
  if (playerName != "") {
    database.ref('/chat').set({message: playerName + ' has disconnected.'});
  }
  if (numPlayers < 1) {
    database.ref('/chat').remove();
    database.ref('/turn').remove();
  }
});

//sends the chat message to the database
$("#submitMessage").on('click', function() {
  if (playerNum > 0) {
    database.ref('/chat').set({message: playerName + ': ' + $("#userMessage").val()});
  }
  else {
    alert("Please start the game in order to chat!");
  }
  $("#userMessage").val("");
  return false;
});
