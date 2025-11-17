let buttonColors = ['red', 'blue', 'green', 'yellow'];

let gamePattern = [];
let userClickedPattern = [];


let started = false;
let level = 0;

// Start the game: called from keyboard, start button or touch
function startGame(e){
    // If this was a touch event, prevent synthetic click later
    if(e && e.type === 'touchstart') e.preventDefault();

    if(!started){
        started = true;
        level = 0;
        gamePattern = [];
        $("#start-btn").hide();
        $("#level-title").text("Level " + level);
        nextSequence();
    }
}

// Keyboard start
$(document).on('keydown', function(e){
    if(!started) startGame(e);
});

// Start button (visible) and touch support
$("#start-btn").on('click touchstart', function(e){ startGame(e); });

// Support both click and touchstart on color buttons. preventDefault on touch to avoid duplicate synthetic clicks.
$(".btn").on('click touchstart', function(e){
    if(e.type === 'touchstart') e.preventDefault();

    let userChosenColor = $(this).attr('id');
    userClickedPattern.push(userChosenColor);

    playSound(userChosenColor);
    animatePress(userChosenColor);
    checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel){
    if(gamePattern[currentLevel] === userClickedPattern[currentLevel]){
        if(userClickedPattern.length === gamePattern.length){
            setTimeout(function(){
                nextSequence()
            }, 1000);
        }
    } else{
        playSound('wrong');
        $("body").addClass('game-over');
        $("#level-title").text("Game Over! Press Any Key To Restart");

        setTimeout(function(){
            $("body").removeClass("game-over")
        }, 200);

        startOver();
    }
}

function nextSequence(){
    userClickedPattern = [];
    level++;
    $("#level-title").text("Level " + level);
    let randomNumber = Math.floor(Math.random() * 4);
    let randomChosenColor = buttonColors[randomNumber];
        gamePattern.push(randomChosenColor);

    $("#"+randomChosenColor).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randomChosenColor);
}

function playSound(name){
    let sound = new Audio("sounds/"+name+".mp3");
    sound.play();
}

function startOver(){
    level = 0;
    gamePattern = [];
    started = false;
}

function animatePress(currentColor){
    $("#"+currentColor).addClass('pressed');
    setTimeout(function(){
        $("#"+currentColor).removeClass('pressed');
    }, 100);
}
