// Board setup
let board;
const boardWidth = 897;
const boardHeight = 510;
let context;

// Bird setup
const birdWidth = 40; // Width/height ratio = 408/228 = 17/12
const birdHeight = 40;
const birdX = boardWidth / 8;
const birdY = boardHeight / 2;
let birdImages = [];
let currentBirdImageIndex = 0; // Declare the variable here
let birdImg;
const bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
    angle: 0 // New angle property
};

// Pipes setup
let pipeArray = [];
const pipeWidth = 60;
const pipeHeight = 300;
const pipeX = boardWidth;
const pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// Background setup
let bgImg;
let bgX = 0;
const bgVelocity = 1; // Background scroll speed

// igoigoigo image setup
let igoigoigoImg;
let showIgoIgoIgo = false;
let showWenderson = false;

// Variables for controlling igoigoigo appearances
let igoigoigoAppearances = 0; // Counter for igoigoigo appearances
const igoigoigoMaxAppearances = 3; // Maximum number of times igoigoigo can appear

// Physics setup
let velocityX = -2; // Pipes moving left speed
let velocityY = 0; // Bird jump speed
const gravity = 0.4;
const pipeSpeedIncrement = -0.005; // Speed increment for pipes every 5 points

let gameOver = false;
let score = 0;
let lastImageChangeScore = 0; // Variable to track last score where image was changed

// Random score targets for Easter eggs
const igoigoigoScoreTarget = Math.floor(Math.random() * 6) + 2; // Random number between 2 and 7
const wendersonScoreTarget = 100; // Target score for Wenderson image
console.log("IgoIgoIgo Score Target: " + igoigoigoScoreTarget);
console.log("Wenderson Score Target: " + wendersonScoreTarget);

// Sound setup
let backgroundMusic;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Used for drawing on the board

    // Show start message
    document.getElementById("startMessage").style.display = "block";

    // Load bird images
    birdImages.push("./pintinho-removebg-preview.png");
    birdImages.push("./Cibelly.png"); // Add more bird images as needed
    birdImages.push("./Mateus.png");
    birdImages.push("./Gabriel.png");
    birdImages.push("./Hygor.png"); // Ensure at least 4 images for 20, 40, 60, 80 points
    birdImg = new Image();
    birdImg.src = birdImages[currentBirdImageIndex];
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./pilarzinho-removebg-preview-removebg-preview.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./pilarzinho-removebg-preview-removebg-preview.png";

    igoigoigoImg = new Image();
    igoigoigoImg.src = "./igo.jpeg"; // Ensure this image is in the correct directory

    wendersonImg = new Image();
    wendersonImg.src = "./wenderson-removebg-preview.png"; // New bird image

    bgImg = new Image();
    bgImg.src = "./bgimage3.jpeg";

    // Load background music
    backgroundMusic = new Audio();
    let audioSource = document.createElement('source');
    audioSource.src = './audio_j22.mp3';
    audioSource.type = 'audio/mpeg';
    backgroundMusic.appendChild(audioSource);

    // Fallback for other formats if needed
    let audioSourceFallback = document.createElement('source');
    audioSourceFallback.src = './audio_j22.ogg';
    audioSourceFallback.type = 'audio/ogg';
    backgroundMusic.appendChild(audioSourceFallback);

    backgroundMusic.loop = true;

    document.addEventListener("keydown", startGameOnEnter);
};

function startGameOnEnter(e) {
    if (e.code == "Enter") {
        // Hide start message
        document.getElementById("startMessage").style.display = "none";

        startGame();
        document.removeEventListener("keydown", startGameOnEnter);
    }
}

function startGame() {
    backgroundMusic.play().catch(function (error) {
        console.error("Failed to play audio:", error);
    });
    requestAnimationFrame(update);
    setInterval(placePipes, 2000); // Every 2 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Background
    bgX -= bgVelocity;
    if (bgX <= -boardWidth) {
        bgX = 0;
    }
    context.drawImage(bgImg, bgX, 0, boardWidth, boardHeight);
    context.drawImage(bgImg, bgX + boardWidth, 0, boardWidth, boardHeight);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity to current bird.y, limit the bird.y to top of the canvas

    // Apply rotation for the bird
    bird.angle = Math.min(Math.max(velocityY * 2, -45), 45);

    context.save();
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(bird.angle * Math.PI / 180);
    context.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    context.restore();

    if (bird.y > board.height) {
        gameOver = true;
        disableKeyboard();
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            disableKeyboard();
        }
    }

    // Clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Removes first element from the array
    }

    // Score
    context.fillStyle = "orange";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Increase pipe speed every 5 points
    if (score % 5 === 0 && score !== 0) {
        velocityX += pipeSpeedIncrement;
    }

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        context.fillText("Press Enter to restart", 5, 135);
        return;
    }

    // Check for Easter egg conditions
    if (score >= igoigoigoScoreTarget && !gameOver && igoigoigoAppearances < igoigoigoMaxAppearances) {
        showIgoIgoIgo = true;
        igoigoigoAppearances++;
        setTimeout(function() {
            showIgoIgoIgo = false;
        }, 1000); // Show igoigoigo image for 1 second
    }

    // Change bird image if condition is met
    if (score === wendersonScoreTarget && birdImg.src !== wendersonImg.src) {
        showWenderson = true;
    }

    // Show igoigoigo image if condition is met
    if (showIgoIgoIgo) {
        const igoigoigoWidth = 200; // Width of the igoigoigo image
        const igoigoigoHeight = 200; // Height of the igoigoigo image
        const igoigoigoX = (boardWidth - igoigoigoWidth) / 2; // Center X position
        const igoigoigoY = (boardHeight - igoigoigoHeight) / 2; // Center Y position
        context.drawImage(igoigoigoImg, igoigoigoX, igoigoigoY, igoigoigoWidth, igoigoigoHeight);
    }

    // Change bird image at intervals of 20, 40, 60, and 80 points
    if ((score === 20 || score === 40 || score === 60 || score === 80) && !gameOver && lastImageChangeScore !== score) {
        currentBirdImageIndex = (currentBirdImageIndex + 1) % birdImages.length;
        birdImg.src = birdImages[currentBirdImageIndex];
        lastImageChangeScore = score; // Update last image change score
    }

    if (showWenderson) {
        birdImg = wendersonImg;
        bird.width = 200;
        bird.height = 200;
        showWenderson = false; // Ensure this only happens once
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    const openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "Enter") {
        velocityY = -6;
        bird.angle = -45;
    }

    if (gameOver && e.code == "Enter") {
        restartGame();
    }
}

function detectCollision(a, b) {
    const collisionMargin = 10; // Adjust this value to increase/decrease collision area

    return (a.x + collisionMargin) < (b.x + b.width) &&
           (a.x + a.width - collisionMargin) > b.x &&
           (a.y + collisionMargin) < (b.y + b.height) &&
           (a.y + a.height - collisionMargin) > b.y;
}

function disableKeyboard() {
    document.removeEventListener("keydown", moveBird);
    document.addEventListener("keydown", startGameOnEnter);
}

function restartGame() {
    location.reload();
}
