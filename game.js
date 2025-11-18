// ===== PARTICLE EFFECTS SYSTEM (OPTIMIZED) =====
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
        this.velocity.y += 0.1;
        this.velocity.x *= 0.98;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let particles = [];
let particleCanvas = document.getElementById('particle-canvas');
let particleCtx = particleCanvas ? particleCanvas.getContext('2d') : null;
let animationFrameId = null;
let isAnimating = false;

// Set canvas size
if (particleCanvas) {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    window.addEventListener('resize', function() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    });
}

// Optimized animation loop for particles
function animateParticles() {
    if (!particleCtx) return;
    
    if (particles.length === 0) {
        isAnimating = false;
        return;
    }
    
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particleCtx.save();
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(particleCtx);
        
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    particleCtx.restore();
    
    if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animateParticles);
    } else {
        isAnimating = false;
    }
}

function createParticles(x, y, color) {
    const count = Math.floor(Math.random() * 8 + 10); // 10-18 particles (reduced from 20-35)
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
    if (!isAnimating) {
        isAnimating = true;
        animateParticles();
    }
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

// ===== CONFETTI PARTICLES FOR CELEBRATIONS =====
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'][Math.floor(Math.random() * 6)];
        this.size = Math.random() * 8 + 4;
        this.velocity = {
            x: (Math.random() - 0.5) * 12,
            y: Math.random() * -15 - 5
        };
        this.alpha = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationVelocity = (Math.random() - 0.5) * 0.3;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.2; // gravity
        this.velocity.x *= 0.99; // air resistance
        this.alpha -= 0.015;
        this.rotation += this.rotationVelocity;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.translate(-this.x, -this.y);
    }
}

function createConfetti(x, y, count = 20) {
    const adjustedCount = Math.min(count, 25); // Cap at 25 confetti pieces
    for (let i = 0; i < adjustedCount; i++) {
        particles.push(new ConfettiParticle(x, y));
    }
    if (!isAnimating) {
        isAnimating = true;
        animateParticles();
    }
}

// ===== FUN MESSAGES SYSTEM =====
const funMessages = {
    start: [
        'LET\'S GO! 🚀',
        'GET READY! ⚡',
        'HERE WE GO! 🎮',
        'TIME TO PLAY! 🎯',
        'SHOW YOUR SKILLS! 💪',
        'LET\'S ROCK! 🎸'
    ],
    levelUp: [
        'AWESOME! 🔥',
        'NICE MOVES! 💫',
        'YOU GOT IT! ✨',
        'KEEP GOING! 🚀',
        'ON FIRE! 🔥',
        'LEGENDARY! 👑',
        'INCREDIBLE! 🌟',
        'UNSTOPPABLE! 💥'
    ],
    gameOver: [
        'OOPS! 💥',
        'GAME OVER! 😅',
        'TRY AGAIN! 🔄',
        'SO CLOSE! 😬',
        'BETTER LUCK! 🍀',
        'YOU CAN DO IT! 💪'
    ]
};

function showFunMessage(type) {
    const messageElem = $('#fun-message');
    const messages = funMessages[type] || [];
    if (messages.length === 0) return;
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    messageElem.text(randomMsg).stop().fadeIn(300);
    
    setTimeout(function() {
        messageElem.fadeOut(500);
    }, 1500);
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
        
        // Show fun message and confetti
        showFunMessage('start');
        createConfetti(window.innerWidth / 2, 100, 50);
        
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
        
        // Show game over fun message
        showFunMessage('gameOver');
        
        // Create multiple explosion particles on game over
        for (let i = 0; i < 5; i++) {
            setTimeout(function() {
                createParticles(Math.random() * window.innerWidth, Math.random() * window.innerHeight, '#ff0000');
                createConfetti(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 25);
            }, i * 150);
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
    
    // Show fun message and create celebratory confetti on level up
    showFunMessage('levelUp');
    createConfetti(window.innerWidth / 2, 150, 60);
    
    // Play victory fanfare!
    playVictoryFanfare();
    
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

// Victory fanfare sound - plays on level up!
function playVictoryFanfare() {
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = window.audioContext;
    
    function playNote(freq, duration, delay) {
        setTimeout(function(){
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        }, delay);
    }
    
    // Victory fanfare - triumphant notes! (C Major chord progression)
    const fanfareNotes = [
        { freq: 523, duration: 0.15, delay: 0 },     // C
        { freq: 659, duration: 0.15, delay: 100 },   // E
        { freq: 784, duration: 0.15, delay: 200 },   // G
        { freq: 1047, duration: 0.3, delay: 300 }    // C (higher)
    ];
    
    fanfareNotes.forEach(note => {
        playNote(note.freq, note.duration, note.delay);
    });
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

// ===== WEBCAM GESTURE DETECTION SYSTEM =====
let webcamActive = false;
let detector = null;
let webcamStream = null;

class GestureDetector {
    constructor() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('gesture-canvas');
        this.statusDiv = document.getElementById('gesture-status');
        this.peaceSigns = 0;
        this.lastGestureTime = 0;
        this.gestureThreshold = 500; // ms between detections
    }

    async init() {
        try {
            // Load hand detector model
            const detectorConfig = {
                runtime: 'tfjs',
                modelType: 'full',
                maxHands: 1
            };
            this.detector = await window.handPoseDetection.createDetector(
                window.handPoseDetection.SupportedModels.MediaPipeHands,
                detectorConfig
            );
            
            // Start webcam
            this.webcamStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 200, height: 150 }
            });
            this.video.srcObject = this.webcamStream;
            this.video.play();
            
            webcamActive = true;
            detector = this;
            this.detectGestures();
            return true;
        } catch (error) {
            console.error('Webcam error:', error);
            this.statusDiv.textContent = '❌ Camera denied';
            return false;
        }
    }

    async detectGestures() {
        if (!webcamActive || !this.detector) return;

        try {
            const hands = await this.detector.estimateHands(this.video);

            if (hands.length > 0) {
                const hand = hands[0];
                const indexTip = hand.keypoints[8]; // Index finger tip
                
                // Track cursor position based on index finger
                this.updateCursorPosition(indexTip);
                
                const gesture = this.recognizeGesture(hand.keypoints);
                
                if (gesture && Date.now() - this.lastGestureTime > this.gestureThreshold) {
                    this.lastGestureTime = Date.now();
                    this.statusDiv.textContent = gesture.name;
                    this.handleGesture(gesture);
                }
            } else {
                this.statusDiv.textContent = 'Show hand ✋';
                this.hideCursor();
            }
        } catch (error) {
            console.error('Detection error:', error);
        }

        if (webcamActive) {
            // Increase delay between detections to reduce lag (every 100ms instead of 33ms)
            setTimeout(() => this.detectGestures(), 100);
        }
    }

    updateCursorPosition(fingerTip) {
        // Map finger position from webcam coordinates to screen coordinates
        // The video is 200x150, we need to map it to the full screen
        const cursor = document.getElementById('gesture-cursor');
        
        // X: 0 to 1 maps to 0 to window.innerWidth
        // Y: 0 to 1 maps to 0 to window.innerHeight
        const screenX = fingerTip.x * window.innerWidth;
        const screenY = fingerTip.y * window.innerHeight;
        
        // Update cursor position
        cursor.style.left = (screenX - 20) + 'px'; // -20 to center the cursor
        cursor.style.top = (screenY - 20) + 'px';
        cursor.style.display = 'block';
        
        // Check if cursor is over any game button and show hover effect
        this.checkButtonHover(screenX, screenY);
    }

    hideCursor() {
        document.getElementById('gesture-cursor').style.display = 'none';
    }

    checkButtonHover(x, y) {
        // Get all buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const isHovering = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
            
            if (isHovering) {
                btn.style.filter = 'brightness(1.2)';
                btn.style.cursor = 'pointer';
            } else {
                btn.style.filter = '';
                btn.style.cursor = 'default';
            }
        });
    }

    recognizeGesture(keypoints) {
        // Get hand landmarks
        const wrist = keypoints[0];
        const thumbTip = keypoints[4];
        const indexTip = keypoints[8];
        const middleTip = keypoints[12];
        const ringTip = keypoints[16];
        const pinkyTip = keypoints[20];

        // Helper: calculate distance between two points
        const distance = (p1, p2) => {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        };

        // Helper: check if finger is extended (tip is above base)
        const isFingerExtended = (tip, base) => tip.y < base.y - 20;

        // Get finger states
        const thumbUp = thumbTip.y < keypoints[2].y;
        const indexUp = isFingerExtended(indexTip, keypoints[6]);
        const middleUp = isFingerExtended(middleTip, keypoints[10]);
        const ringUp = isFingerExtended(ringTip, keypoints[14]);
        const pinkyUp = isFingerExtended(pinkyTip, keypoints[18]);

        // Recognize gestures
        
        // PEACE SIGN (Index + Middle up, others down)
        if (!thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) {
            return { name: 'PEACE ✌️ - START!', action: 'start' };
        }

        // OPEN HAND / STOP (All fingers extended)
        if (thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
            return { name: 'STOP ✋', action: 'stop' };
        }

        // THUMBS UP (Thumb up, fingers down)
        if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
            return { name: 'THUMBS UP 👍', action: 'thumbsUp' };
        }

        // FIST (All fingers closed)
        if (!thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
            return { name: 'FIST 👊', action: 'fist' };
        }

        // POINTER (Index up only)
        if (!thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) {
            return { name: 'POINT 👉', action: 'point' };
        }

        return null;
    }

    handleGesture(gesture) {
        if (gesture.action === 'start' && !started) {
            startGame();
            this.statusDiv.textContent = '🎮 STARTED!';
        } else if (gesture.action === 'thumbsUp') {
            createConfetti(Math.random() * window.innerWidth, 100, 30);
        } else if (gesture.action === 'fist') {
            showFunMessage('start');
        }
    }

    stop() {
        webcamActive = false;
        this.hideCursor();
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
        }
        this.video.srcObject = null;
    }
}

// Webcam button handlers
$('#webcam-mode-btn').on('click', async function() {
    const container = $('#webcam-container');
    if (container.is(':visible')) {
        // Hide webcam
        container.hide();
        $(this).text('🎥 Show').css('background', '#247ba0').css('color', '#FEF2BF');
    } else {
        // Show webcam
        container.show();
        $(this).text('🎥 Hide').css('background', '#00ff00').css('color', '#011F3F');
    }
});

$('#toggle-webcam-btn').on('click', function() {
    const canvas = document.getElementById('gesture-canvas');
    const video = document.getElementById('webcam');
    if (canvas.style.display === 'none') {
        canvas.style.display = 'block';
        video.style.display = 'none';
        $(this).text('📷 Canvas');
    } else {
        canvas.style.display = 'none';
        video.style.display = 'block';
        $(this).text('📹 Webcam');
    }
});

$('#close-webcam-btn').on('click', function() {
    // Just hide the container, keep gesture detection running
    $('#webcam-container').hide();
    $('#webcam-mode-btn').text('🎥 Show').css('background', '#247ba0').css('color', '#FEF2BF');
});

// ===== AUTO-START GESTURE DETECTION ON PAGE LOAD =====
$(document).ready(function() {
    // Auto-initialize gesture control on page load
    setTimeout(async function() {
        try {
            const gestureDetector = new GestureDetector();
            const initialized = await gestureDetector.init();
            
            if (initialized) {
                $('#webcam-container').show();
                $('#webcam-mode-btn').text('🎥 Hide').css('background', '#00ff00').css('color', '#011F3F');
                $('#gesture-status').text('✋ Show hand to start!');
                console.log('✅ Gesture control active! Show peace sign (✌️) to start game.');
            }
        } catch (error) {
            console.error('Gesture detection failed:', error);
            $('#gesture-status').text('❌ Camera not available');
        }
    }, 800); // Small delay to ensure DOM is ready
});

