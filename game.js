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
    // Create audio context (use singleton to avoid browser blocking)
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = window.audioContext;
    const now = ctx.currentTime;
    
    // Create fun cartoon-style sound effect
    function playCartoonBeep(startFreq, endFreq, duration = 0.3, delay = 0) {
        setTimeout(function(){
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square'; // Square wave = more retro/cartoon
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
            
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        }, delay);
    }
    
    // Color button sounds - ascending "boops" with character
    const cartoonSounds = {
        'red': { start: 400, end: 600, duration: 0.25 },      // Low to mid boop
        'green': { start: 600, end: 800, duration: 0.25 },    // Mid boop
        'blue': { start: 800, end: 1000, duration: 0.25 },    // High boop
        'yellow': { start: 1000, end: 1200, duration: 0.25 }  // Highest boop
    };
    
    if(name === 'wrong'){
        // Funny descending "failure" sound - like a game over buzzer
        playCartoonBeep(1200, 200, 0.4, 0);      // Sad descending whoosh
        playCartoonBeep(150, 100, 0.3, 250);     // Extra sad low buzz
    } else if(cartoonSounds[name]){
        const sound = cartoonSounds[name];
        playCartoonBeep(sound.start, sound.end, sound.duration, 0);
        
        // Add a secondary "echo" beep for extra cartoon fun
        playCartoonBeep(sound.end, sound.start, sound.duration * 0.6, sound.duration * 0.1);
    }
}

function startOver(){
    level = 0;
    gamePattern = [];
    started = false;
    $("#start-btn").show();
}

function animatePress(currentColor){
    $("#"+currentColor).addClass('pressed');
    setTimeout(function(){
        $("#"+currentColor).removeClass('pressed');
    }, 100);
}
