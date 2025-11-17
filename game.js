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
    
    // Helper function to play a single note
    function playNote(freq, delay = 0, gain = 0.15, harmonic1Freq = null, harmonic1Gain = 0.08) {
        setTimeout(function(){
            const now = ctx.currentTime; // Get time at moment of play
            const duration = 0.6;
            
            const osc = ctx.createOscillator();
            const gain_node = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            osc.connect(gain_node);
            gain_node.connect(ctx.destination);
            
            // Smooth attack and release
            gain_node.gain.setValueAtTime(0, now);
            gain_node.gain.linearRampToValueAtTime(gain, now + 0.08);
            gain_node.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            osc.start(now);
            osc.stop(now + duration);
            
            // Add harmonic
            if(harmonic1Freq){
                const harmonic = ctx.createOscillator();
                const harmonic_gain = ctx.createGain();
                
                harmonic.type = 'sine';
                harmonic.frequency.value = harmonic1Freq;
                
                harmonic.connect(harmonic_gain);
                harmonic_gain.connect(ctx.destination);
                
                harmonic_gain.gain.setValueAtTime(0, now);
                harmonic_gain.gain.linearRampToValueAtTime(harmonic1Gain, now + 0.08);
                harmonic_gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                harmonic.start(now);
                harmonic.stop(now + duration);
            }
        }, delay);
    }
    
    const frequencies = {
        'red': 264,
        'green': 330,
        'blue': 396,
        'yellow': 528
    };
    
    if(name === 'wrong'){
        playNote(440, 0, 0.12);    // A4
        playNote(330, 100, 0.12);  // E4
        playNote(220, 200, 0.12);  // A3
    } else {
        const freq = frequencies[name] || 440;
        playNote(freq, 0, 0.2, freq * 2, 0.1);
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
