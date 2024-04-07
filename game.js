const gameBoard = document.getElementById('game-board');
// let ballCount = 0;
const balls = [];

const gravity = 5;
const damping = 0.5; // Damping factor

function createBall(x, y, size) {
    const ball = document.createElement('div');
    ball.className = 'ball ' + size;
    ball.textContent = size;

    // ball.textContent = ++ballCount;
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    ball.vx = 0; // x velocity
    ball.vy = 0; // y velocity
    gameBoard.appendChild(ball);
    balls.push(ball);

    return ball;
}

function getRandomSize() {
    const sizes = ['ball_1', 'ball_2', 'ball_4', 'ball_8'];

    // return sizes[1];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function handleCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];

            const dx = parseFloat(ball2.style.left) - parseFloat(ball1.style.left);
            const dy = parseFloat(ball2.style.top) - parseFloat(ball1.style.top);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball1.clientWidth / 2 + ball2.clientWidth / 2) {
                // Collided
                handleCollision(ball1, ball2, dx, dy, distance);
            }
        }
    }
}

function handleCollision(ball1, ball2, dx, dy, distance) {
    const angle = Math.atan2(dy, dx);
    const totalRadius = (ball1.clientWidth + ball2.clientWidth) / 2;

    // Move balls apart to avoid overlapping
    let overlap = totalRadius - distance;
    if (overlap <= 0) {
        overlap = 1;
    }
    const sepX = (overlap / 2) * Math.cos(angle);
    const sepY = (overlap / 2) * Math.sin(angle);

    ball1.style.left = (parseFloat(ball1.style.left) - sepX) + 'px';
    ball1.style.top = (parseFloat(ball1.style.top) - sepY) + 'px';
    ball2.style.left = (parseFloat(ball2.style.left) + sepX) + 'px';
    ball2.style.top = (parseFloat(ball2.style.top) + sepY) + 'px';

    // Check if both balls are the largest size
    if (ball1.classList[1] === 'ball_8' && ball2.classList[1] === 'ball_8') {
        // Remove the collided balls
        ball1.remove();
        ball2.remove();

        score += 10; // Increase the score by 10
        updateScore(); // Update the score UI
    }else if (ball1.classList[1] === ball2.classList[1]) {
        // Remove the collided balls
        ball1.remove();
        ball2.remove();

        // Create a new ball with a larger size
        const newSize = getNextSize(ball1.classList[1]);
        const newX = (parseFloat(ball1.style.left) + parseFloat(ball2.style.left)) / 2;
        const newY = (parseFloat(ball1.style.top) + parseFloat(ball2.style.top)) / 2;
        const newBall = createBall(newX, newY, newSize);

        // Initialize a random velocity for the new ball
        newBall.vx = (Math.random() - 0.5) * 5;
        newBall.vy = (Math.random() - 0.5) * 5;

        score += 5; // Increase the score by 5
        updateScore(); // Update the score UI
    } else {
        // Calculate new velocities after collision
        // (remaining code for handling non-merging collisions)
        // Calculate new velocities after collision
        const angleNormal = Math.atan2(ball2.offsetTop - ball1.offsetTop, ball2.offsetLeft - ball1.offsetLeft);
        const magnitude1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const magnitude2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
        const direction1 = Math.atan2(ball1.vy, ball1.vx);
        const direction2 = Math.atan2(ball2.vy, ball2.vx);

        const newVx1 = magnitude1 * Math.cos(direction1 - angleNormal);
        const newVy1 = magnitude1 * Math.sin(direction1 - angleNormal);
        const newVx2 = magnitude2 * Math.cos(direction2 - angleNormal);
        const newVy2 = magnitude2 * Math.sin(direction2 - angleNormal);

        // Swap velocities
        ball1.vx = newVx2;
        ball1.vy = newVy2;
        ball2.vx = newVx1;
        ball2.vy = newVy1;
    }
}

function getNextSize(currentSize) {
    const sizes = ['ball_1', 'ball_2', 'ball_4', 'ball_8'];
    const currentIndex = sizes.indexOf(currentSize);

    // Check if the current size is not the largest
    if (currentIndex < sizes.length - 1) {
        // Return the next size in the array
        return sizes[currentIndex + 1];
    }

    // Return the current size if it's already the largest
    return currentSize;
}

function update() {
    handleCollisions();

    balls.forEach(ball => {
        // Apply gravity
        ball.vy += gravity;

        // Apply damping
        ball.vx *= damping;
        ball.vy *= damping;

        const currentLeft = parseFloat(ball.style.left);
        const currentTop = parseFloat(ball.style.top);
        let newLeft = currentLeft + ball.vx;
        let newTop = currentTop + ball.vy;

        if (newLeft <= 0 || newLeft >= gameBoard.clientWidth - ball.clientWidth) {
            ball.vx = -ball.vx * damping; // Reflect and dampen the horizontal velocity
            newLeft = Math.max(0, Math.min(newLeft, gameBoard.clientWidth - ball.clientWidth));
        }

        if (newTop <= 0) {
            ball.vy = -ball.vy * damping; // Reflect and dampen the vertical velocity
            newTop = 0;
        }

        // Adjust the ball's position to stop at the bottom
        if (newTop >= gameBoard.clientHeight - ball.clientHeight) {
            newTop = gameBoard.clientHeight - ball.clientHeight;
            ball.vy = 0; // Stop the ball when it reaches the bottom
        }

        ball.style.left = newLeft + 'px';
        ball.style.top = newTop + 'px';
    });

    requestAnimationFrame(update);
}

document.addEventListener('click', (event) => {
    const rect = gameBoard.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const randomSize = getRandomSize();
    const newBall = createBall(mouseX, mouseY, randomSize);

    // Initialize random velocity
    newBall.vx = (Math.random() - 0.5) * 5;
    newBall.vy = (Math.random() - 0.5) * 5;
});

let score = 0;

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = 'Score: ' + score;
}


// Create the score UI element
const scoreElement = document.createElement('div');
scoreElement.id = 'score';
scoreElement.textContent = 'Score: 0';
gameBoard.appendChild(scoreElement);

// Update the score UI initially
updateScore();

// Start the game loop
requestAnimationFrame(update);