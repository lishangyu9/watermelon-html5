const gameBoard = document.getElementById('game-board');
let ballCount = 0;
const balls = [];

const gravity = 0.1;
const damping = 0.98; // Damping factor

function createBall(x, y, size) {
    const ball = document.createElement('div');
    ball.className = 'ball ' + size;
    ball.textContent = ++ballCount;
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    ball.vx = 0; // x velocity
    ball.vy = 0; // y velocity
    gameBoard.appendChild(ball);
    balls.push(ball);

    ball.addEventListener('click', () => {
        mergeBalls(ball);
    });

    return ball;
}

function getRandomSize() {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function mergeBalls(ball) {
    const ballIndex = balls.indexOf(ball);
    if (ballIndex !== -1 && ballIndex < balls.length - 1) {
        const nextBall = balls[ballIndex + 1];

        if (ball.classList.contains(nextBall.classList[1])) {
            // Calculate the position and velocity for the new merged ball
            const newX = (parseFloat(ball.style.left) + parseFloat(nextBall.style.left)) / 2;
            const newY = (parseFloat(ball.style.top) + parseFloat(nextBall.style.top)) / 2;
            const newSize = ball.classList[1];
            const newBall = createBall(newX, newY, newSize);

            // Transfer velocities based on mass (size)
            const mass1 = ball.clientWidth * ball.clientHeight;
            const mass2 = nextBall.clientWidth * nextBall.clientHeight;
            const totalMass = mass1 + mass2;

            newBall.vx = (mass1 / totalMass) * ball.vx + (mass2 / totalMass) * nextBall.vx;
            newBall.vy = (mass1 / totalMass) * ball.vy + (mass2 / totalMass) * nextBall.vy;

            // Remove the merged balls
            ball.remove();
            nextBall.remove();
        }
    }
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
    const targetVx1 = ball2.vx * Math.cos(angle) + ball2.vy * Math.sin(angle);
    const targetVy1 = ball2.vy * Math.cos(angle) - ball2.vx * Math.sin(angle);
    const targetVx2 = ball1.vx * Math.cos(angle) + ball1.vy * Math.sin(angle);
    const targetVy2 = ball1.vy * Math.cos(angle) - ball1.vx * Math.sin(angle);

    // Swap velocities
    ball1.vx = targetVx1;
    ball1.vy = targetVy1;
    ball2.vx = targetVx2;
    ball2.vy = targetVy2;

    // Separate the balls to avoid overlapping
    const overlap = (ball1.clientWidth / 2 + ball2.clientWidth / 2) - distance;
    const sepX = (overlap / 2) * Math.cos(angle);
    const sepY = (overlap / 2) * Math.sin(angle);

    ball1.style.left = (parseFloat(ball1.style.left) - sepX) + 'px';
    ball1.style.top = (parseFloat(ball1.style.top) - sepY) + 'px';
    ball2.style.left = (parseFloat(ball2.style.left) + sepX) + 'px';
    ball2.style.top = (parseFloat(ball2.style.top) + sepY) + 'px';
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

        if (newLeft <= 0) {
            ball.vx = -ball.vx * damping; // Reflect and dampen the horizontal velocity
            newLeft = 0;
        }

        if (newLeft >= gameBoard.clientWidth - ball.clientWidth) {
            ball.vx = -ball.vx * damping; // Reflect and dampen the horizontal velocity
            newLeft = gameBoard.clientWidth - ball.clientWidth;
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

// Start the game loop
requestAnimationFrame(update);
