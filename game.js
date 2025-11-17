// ===== PARTICLE EFFECTS SYSTEM =====
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.015;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.1; // gravity
        this.velocity.x *= 0.98; // air resistance
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];
let particleCanvas = document.getElementById('particle-canvas');
let particleCtx = particleCanvas ? particleCanvas.getContext('2d') : null;

// Set canvas size
if (particleCanvas) {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    window.addEventListener('resize', function() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    });
}

// Animation loop for particles
function animateParticles() {
    if (!particleCtx) return;
    
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(particleCtx);
        
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
    }
}

function createParticles(x, y, color) {
    const count = Math.floor(Math.random() * 15 + 20); // 20-35 particles
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
    animateParticles();
}

// Get color for particles
function getColorForButton(buttonId) {
    const colorMap = {
        'red': '#ff4444',
        'green': '#44ff44',
        'blue': '#4444ff',
        'yellow': '#ffff44'
    };
    return colorMap[buttonId] || '#ffffff';
}

// ===== GAME LOGIC =====
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
        $("#level-title").text("Level " + level).addClass('level-up');
        
        // Add animation class to container
        $(".container").addClass('start-animation');
        
        setTimeout(function(){
            $(".container").removeClass('start-animation');
            nextSequence();
        }, 600);
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
        
        // Create explosion particles on game over
        for (let i = 0; i < 5; i++) {
            setTimeout(function() {
                createParticles(Math.random() * window.innerWidth, Math.random() * window.innerHeight, '#ff0000');
            }, i * 100);
        }
        
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
    
    // Add level-up animation to title
    let titleElem = $("#level-title");
    titleElem.text("Level " + level).addClass('level-up');
    
    // Create celebratory particles on level up
    createParticles(window.innerWidth / 2, 100, '#ffff00');
    
    // Remove animation class after it completes
    setTimeout(function(){
        titleElem.removeClass('level-up');
    }, 600);
    
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
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
    
    // Add shake animation on game over
    $(".container").addClass('shake');
    setTimeout(function(){
        $(".container").removeClass('shake');
    }, 500);
    
    // Add animation to button on restart
    $("#start-btn").show().addClass('restart-animation');
    setTimeout(function(){
        $("#start-btn").removeClass('restart-animation');
    }, 500);
}

function animatePress(currentColor){
    const button = $("#"+currentColor);
    
    // Get button position for particle effects
    const buttonOffset = button.offset();
    const buttonWidth = button.outerWidth();
    const buttonHeight = button.outerHeight();
    const centerX = buttonOffset.left + buttonWidth / 2;
    const centerY = buttonOffset.top + buttonHeight / 2;
    
    // Create particle burst
    createParticles(centerX, centerY, getColorForButton(currentColor));
    
    // Add pressed effect
    button.addClass('pressed');
    
    // Trigger character dance
    const character = button.find('.character');
    character.addClass('dancing');
    
    setTimeout(function(){
        button.removeClass('pressed');
        character.removeClass('dancing');
    }, 600);
}
