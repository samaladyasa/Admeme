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

function playSound(name){
    // Create audio context (use singleton to avoid browser blocking)
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = window.audioContext;
    const now = ctx.currentTime;
    const duration = 0.6;
    
    // Create multiple oscillators for richer, soothing sound
    function playNote(freq, gain = 0.15, harmonic1Freq = null, harmonic1Gain = 0.08) {
        const osc = ctx.createOscillator();
        const gain_node = ctx.createGain();
        
        osc.type = 'sine'; // Smooth sine wave
        osc.frequency.value = freq;
        
        osc.connect(gain_node);
        gain_node.connect(ctx.destination);
        
        // Smooth attack and release for soothing effect
        gain_node.gain.setValueAtTime(0, now);
        gain_node.gain.linearRampToValueAtTime(gain, now + 0.08); // Soft attack
        gain_node.gain.exponentialRampToValueAtTime(0.01, now + duration); // Smooth release
        
        osc.start(now);
        osc.stop(now + duration);
        
        // Add optional harmonic for richness
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
    }
    
    // Soothing, pleasant frequencies for each color (major chord progression)
    const frequencies = {
        'red': 264,        // C4 - warm base
        'green': 330,      // E4 - natural middle
        'blue': 396,       // G4 - bright upper
        'yellow': 528      // C5 - shimmering high
    };
    
    if(name === 'wrong'){
        // Gentle, descending chime for wrong answer (not harsh buzz)
        playNote(440, 0.12);  // A4
        setTimeout(() => playNote(330, 0.12), 100); // E4
        setTimeout(() => playNote(220, 0.12), 200); // A3
    } else {
        // Play soothing color tone with harmonic
        const freq = frequencies[name] || 440;
        playNote(freq, 0.2, freq * 2, 0.1); // Add octave harmonic for richness
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
