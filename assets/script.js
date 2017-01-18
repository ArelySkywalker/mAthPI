//  global variable for the timer
var intervalId;

var game = {
    name: 'Trivia?',
    category: '',
    score: 0,
    round: 1,
    token: '',
    questions: [],
    question: {},
    options: [],
    randomizedOptions: [],
    // timer object
    timer: {
        time: 15,
        reset: function() {
            game.timer.time = 15;
            $('#timer').text(game.timer.time);
        },
        start: function() {
            intervalId = setInterval(game.timer.count, 1000);
        },
        stop: function() {
            clearInterval(intervalId);
        },
        count: function() {
            game.timer.time--;
            if(game.timer.time === 0) {
                // display timeout modal
                game.answerModal(1);
            } else {
                $('#timer').text(game.timer.time);
            }
        }
    },
    answerModal: function answerModal (result) {
        switch(result) {
            case 1:
                $('#answer-modal').text('out of time! - correct answer: ' + game.answer);
                break;
            case 2:
                $('#answer-modal').text('correct! ' + game.answer);
                break;
            case 3:
                $('#answer-modal').text('incorrect! ' + game.answer);
                break;
        }
        $('#answerModal').modal('show');
        game.nextQuestion();
    },
    nextQuestion: function nextQuestion() {
        // stop timer
        game.timer.stop();
        setTimeout(function() {
            $('#answerModal').modal('hide');
            if(game.questions.length) {
                game.question = game.questions.pop();
                game.askQuestion();
            } else {
                game.reset();
            }
        },3000);
    },
    // reset game object for new round
    reset: function reset() {
        game.timer.stop();
        game.timer.reset();
        game.category = '';
        questions = [];
        question = {};
        options = [];
        randomizedOptions = [];
        $('#intro').html('final score: ' + game.score + '/' + game.round * 10 + '<p>play another round?</p>');
        // display start modal
        $('#startModal').modal('show');
        game.round++;
    },
    // gets new api session key
    getKey: function getKey() {
        $.ajax({
            url: 'https://opentdb.com/api_token.php?command=request',
        }).done(function(response) {
            game.token = response.token;
        });
    },
    // takes session token, gets questions, prints first question to screen
    getQuestions: function getQuestions() {
        $.ajax({
            url: 'https://opentdb.com/api.php',
            method: 'GET',
            data: {
                amount: 23,
                category: 19,
                token: game.token,
            },
        }).done(function(response) {
            // empyt questions array
            game.questions = [];
            // iterate response results array
            response.results.forEach(function(e) {
                // add question array
                game.questions.push(e);
            });
            game.question = game.questions.pop();
            game.askQuestion();
        });
    },
    // takes array and returns new array with randomized order
    randomizeOptions: function randomizeOptions() {
        game.randomizedOptions = [];
        for(var i = game.options.length; i > 0; i--) {
            var randomChoice = Math.floor(Math.random() * i);
            var option = game.options.splice(randomChoice,1);
            game.randomizedOptions.push(option[0]);
        }
    },
    askQuestion: function askQuestion() {
        // reset timer
        game.timer.reset();
        // add question to page
        $('#question').html('<h2>' + game.question.question + '</h2>');
        // empty answers
        $('#answers').empty();
        // set correct answer
        game.answer = game.question.correct_answer;
        // add correct answer to options array
        game.options.push(game.answer);
        // add incorrect answers to options array
        game.question.incorrect_answers.forEach(function(e) {
            game.options.push(e);
        });
        // randomize options
        game.randomizeOptions();
        // add answer choices to page
        game.randomizedOptions.forEach(function(e) {
            if(e === game.answer) {
                var newButton = $('<button/>', {
                    html: e,
                    data: {name: e},
                    class: 'btn-secondary btn-lg option correct',
                    click: function () {
                        // increment score
                        game.score++;
                        // display correct modal
                        game.answerModal(2);
                    }
                });
            } else {
                var newButton = $('<button/>', {
                    html: e,
                    data: {name: e},
                    class: 'btn-secondary btn-lg option wrong',
                    click: function () {
                        // display incorret modal
                        game.answerModal(3);
                    }
                });
            }
            newButton.appendTo('#answers');
        });
        // start timer
        game.timer.start();
    },
    // start playing first round, get key
    play: function play() {
        // display start modal
        $('#startModal').modal('show');
        // set event listener on play button
        $('#play').on('click',function() {
            // get key
            game.getKey();
            // getQuestions - this fires askQuestion when done
            game.getQuestions();
        });
    },
}

game.play();
