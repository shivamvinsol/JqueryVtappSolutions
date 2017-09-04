var Questions = function(){
  this.operators = ["+", "-", "*", "/"];
  this.questionNumber = 0;
  this.score = 0;
  this.results = {};
  this.totalQuestions = 5;
  this.timerCount = 10;
};

Questions.prototype.init = function() {
  var _this = this;
  $("input[data-behaviour='answer']").on("keypress", function(event){
    if(event.charCode < 48 || event.charCode > 57){     //number 0-9: code 48-57
      event.preventDefault();
    }
  });

  $("button[data-behaviour='timerQuestion']").on("click", function(){
    clearInterval(_this.timerId);
    _this.checkAnswer();
    _this.storeResult();
    _this.updateScore();
    _this.regainInputState();
    if(_this.questionNumber < _this.totalQuestions){
      _this.newQuestion();
      _this.updateTimer();
    }
    else{
      _this.scoreCard();
    }
  });
};

Questions.prototype.newQuestion = function() {
  this.questionNumber++;
  var firstOperand = this.randomNumber();
  var secondOperand = this.randomNumber();
  var operator = this.operators[Math.floor(Math.random() * this.operators.length)];
  var question = "Question Number " + this.questionNumber + "<br>";
  question += firstOperand + " " + operator + " " + secondOperand;
  $("div[data-behaviour='question']").html(question);
  this.answer = parseInt(eval(firstOperand + operator + secondOperand));
};

Questions.prototype.updateTimer = function() {
  var _this = this;
  var timeLeft = this.timerCount;
  var timer = $("div[data-behaviour='timer']");
  this.timeOut = false;
  timer.text(timeLeft + " seconds left.");
  this.timerId = setInterval(function(){
    timer.text(timeLeft + " seconds left.");
    if(timeLeft === 0){
      timer.html("Time Over!!!");
      _this.timeOut = true;
      clearInterval(_this.timerId);
    }
    timeLeft--;
  }, 1000);
};

Questions.prototype.checkAnswer = function() {
  var userAnswer = parseInt($("input[data-behaviour='answer']").val());
  if (this.timeOut === true) {
    this.response = "Time Out";
  }
  else if(this.answer === userAnswer){
    this.response = "correct";
  }
  else{
    this.response = "wrong";
  }
};

Questions.prototype.storeResult = function() {
  var result = {
    response : this.response,
    answer : this.answer
  };
  this.results[this.questionNumber] = result;
};

Questions.prototype.updateScore = function() {
  if(this.response === "correct"){
    this.score++;
    $("div[data-behaviour='score']").html("Score : " + this.score);
  }
};

Questions.prototype.regainInputState = function() {
  $("input[data-behaviour='answer']").val("").focus();
};

Questions.prototype.randomNumber = function() {
  return Math.floor(Math.random() * 19) + 1;      // random numbers from 1 to 19.
};

Questions.prototype.scoreCard = function() {
  var _this = this;
  var scoreCard = $("<div/>");
  scoreCard.addClass('scorecard');
  var body = $("body");
  body.find("*").remove();
  var table = $("<table/>");

  var headerRow = $("<tr/>");
  var header1 = $("<th/>").text("Question Number");
  var header2 = $("<th/>").text("Response");
  var header3 = $("<th/>").text("Correct Answer");
  headerRow.append(header1);
  headerRow.append(header2);
  headerRow.append(header3);
  table.append(headerRow);

  scoreCard.append($("<h1>SCORE CARD</h1>"));
  scoreCard.append(table);
  body.append(scoreCard);

  $.each(_this.results, function(event, value){
    var addRow = false;
    var row = $("<tr/>");
    $("<td/>").text(event).appendTo(row);
    $.each(value, function(k, v){
      $("<td/>").text(v).appendTo(row);
      if(k === "response" && v !== "correct"){
        addRow = true;
      }
    });
    if(addRow){
      row.appendTo(table);
    }
  });

  var totalScore = $("<p/>").html("<b>TOTAL SCORE : " + this.score + " / " + this.totalQuestions + "</b>");
  scoreCard.append(totalScore);
};

$(document).ready(function(){
  var quiz = new Questions();
  quiz.init();
  quiz.newQuestion();
  quiz.updateTimer();
});
