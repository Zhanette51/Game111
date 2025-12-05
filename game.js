// ===================== НАСТРОЙКИ ИГРЫ =====================
const CONFIG = {
    player: {
        startX: 80,
        startY: 200,
        width: 50,
        height: 70,
        speed: 5,
        jumpForce: 16,
        lives: 3
    },
    gravity: 0.7,
    world: {
        skyColor: '#87CEEB'
    }
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const loadingElement = document.getElementById('loading');
const restartButton = document.getElementById('restartButton');

// Устанавливаем размер canvas 70% от экрана
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const aspectRatio = 16/9;
    let width = containerWidth;
    let height = containerHeight;
    
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// Создаем простые спрайты программно
function createPixelSprite(width, height, type) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    
    spriteCtx.clearRect(0, 0, width, height);
    
    switch(type) {
        case 'player':
            // Мама-Марио (пиксельная)
            spriteCtx.fillStyle = '#FF6B6B';
            spriteCtx.fillRect(width*0.2, height*0.3, width*0.6, height*0.4);
            spriteCtx.fillRect(width*0.2, height*0.7, width*0.25, height*0.3);
            spriteCtx.fillRect(width*0.55, height*0.7, width*0.25, height*0.3);
            
            spriteCtx.fillStyle = '#FFD700';
            spriteCtx.fillRect(width*0.25, height*0.05, width*0.5, height*0.25);
            
            spriteCtx.fillStyle = '#FFE4B5';
            spriteCtx.fillRect(width*0.3, height*0.1, width*0.4, height*0.2);
            
            spriteCtx.fillStyle = '#000';
            spriteCtx.fillRect(width*0.35, height*0.15, width*0.1, height*0.05);
            spriteCtx.fillRect(width*0.55, height*0.15, width*0.1, height*0.05);
            
            spriteCtx.beginPath();
            spriteCtx.arc(width*0.5, height*0.22, width*0.15, 0, Math.PI);
            spriteCtx.strokeStyle = '#000';
            spriteCtx.lineWidth = 2;
            spriteCtx.stroke();
            break;
            
        case 'ground':
            spriteCtx.fillStyle = '#8B4513';
            spriteCtx.fillRect(0, height*0.6, width, height*0.4);
            
            spriteCtx.fillStyle = '#7CFC00';
            spriteCtx.fillRect(0, height*0.6, width, height*0.1);
            
            spriteCtx.fillStyle = '#A0522D';
            for (let i = 0; i < width; i += 8) {
                for (let j = height*0.6; j < height; j += 8) {
                    if ((i + j) % 16 === 0) {
                        spriteCtx.fillRect(i, j, 4, 4);
                    }
                }
            }
            break;
            
        case 'platform':
            spriteCtx.fillStyle = '#DEB887';
            spriteCtx.fillRect(0, 0, width, height);
            
            spriteCtx.fillStyle = '#8B4513';
            spriteCtx.fillRect(0, 0, width, 5);
            spriteCtx.fillRect(0, height-5, width, 5);
            spriteCtx.fillRect(0, 0, 5, height);
            spriteCtx.fillRect(width-5, 0, 5, height);
            
            spriteCtx.strokeStyle = '#A0522D';
            spriteCtx.lineWidth = 2;
            for (let i = 10; i < width; i += 15) {
                spriteCtx.beginPath();
                spriteCtx.moveTo(i, 5);
                spriteCtx.lineTo(i, height-5);
                spriteCtx.stroke();
            }
            break;
            
        case 'gift':
            spriteCtx.fillStyle = '#FF4081';
            spriteCtx.fillRect(0, 0, width, height);
            
            spriteCtx.fillStyle = '#FFFF00';
            spriteCtx.fillRect(width/2 - 3, 0, 6, height);
            spriteCtx.fillRect(0, height/2 - 3, width, 6);
            
            spriteCtx.beginPath();
            spriteCtx.arc(width/2, height/2, 5, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
            
        case 'flag':
            spriteCtx.fillStyle = '#8B4513';
            spriteCtx.fillRect(width/2 - 5, 0, 10, height);
            
            spriteCtx.fillStyle = '#FF0000';
            spriteCtx.beginPath();
            spriteCtx.moveTo(width/2, height*0.2);
            spriteCtx.lineTo(width, height*0.1);
            spriteCtx.lineTo(width/2, height*0.3);
            spriteCtx.fill();
            break;
            
        case 'cloud':
            spriteCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            spriteCtx.beginPath();
            spriteCtx.arc(width*0.3, height/2, height*0.4, 0, Math.PI * 2);
            spriteCtx.arc(width*0.5, height*0.3, height*0.3, 0, Math.PI * 2);
            spriteCtx.arc(width*0.7, height/2, height*0.4, 0, Math.PI * 2);
            spriteCtx.arc(width*0.5, height*0.7, height*0.3, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
            
        case 'bush':
            spriteCtx.fillStyle = '#228B22';
            spriteCtx.beginPath();
            spriteCtx.arc(width/2, height/2, Math.min(width, height)/2, 0, Math.PI * 2);
            spriteCtx.fill();
            
            spriteCtx.fillStyle = '#32CD32';
            spriteCtx.beginPath();
            spriteCtx.arc(width*0.3, height*0.3, width*0.2, 0, Math.PI * 2);
            spriteCtx.arc(width*0.7, height*0.3, width*0.2, 0, Math.PI * 2);
            spriteCtx.arc(width*0.5, height*0.7, width*0.2, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
            
        case 'flower':
            spriteCtx.fillStyle = '#FF69B4';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                spriteCtx.save();
                spriteCtx.translate(width/2, height/2);
                spriteCtx.rotate(angle);
                spriteCtx.beginPath();
                spriteCtx.ellipse(5, 0, 8, 3, 0, 0, Math.PI * 2);
                spriteCtx.fill();
                spriteCtx.restore();
            }
            
            spriteCtx.fillStyle = '#FFD700';
            spriteCtx.beginPath();
            spriteCtx.arc(width/2, height/2, 4, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
    }
    
    return spriteCanvas;
}

// Создаем все спрайты
const sprites = {
    player: createPixelSprite(50, 70, 'player'),
    ground: createPixelSprite(100, 40, 'ground'),
    platform: createPixelSprite(180, 40, 'platform'),
    gift: createPixelSprite(35, 35, 'gift'),
    flag: createPixelSprite(50, 180, 'flag'),
    cloud: createPixelSprite(120, 60, 'cloud'),
    bush: createPixelSprite(80, 60, 'bush'),
    flower: createPixelSprite(25, 25, 'flower')
};

// Массив приятных сообщений
const giftMessages = [
    "Ты самая добрая! 💖",
    "Твоя улыбка светит! ☀️",
    "Ты всегда поддерживаешь! 🤗",
    "Ты мой главный пример! 👑",
    "Я тебя очень люблю! ❤️",
    "Ты делаешь мир лучше! ✨",
    "Твои объятия - дом! 🏡",
    "Ты самая мудрая! 🦉",
    "Ты вдохновляешь меня! 🎯",
    "Ты прекрасная мама! 🌸"
];

// Игровые объекты
let player = null;
let platforms = [];
let gifts = [];
let flag = null;
let clouds = [];
let bushes = [];
let flowers = [];
let score = 0;
let gameOver = false;
let gameWin = false;
const keys = {};
const particles = [];
let floatingMessages = [];
let platformFloatOffsets = [];

// ===================== УПРАВЛЕНИЕ =====================
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') resetGame();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('resize', () => {
    resizeCanvas();
    initGameObjects();
});

restartButton.addEventListener('click', resetGame);

// Инициализация игровых объектов
function initGameObjects() {
    // Создаем игрока
    player = {
        x: CONFIG.player.startX,
        y: CONFIG.player.startY,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        velocityX: 0,
        velocityY: 0,
        isOnGround: false,
        facingRight: true,
        lives: CONFIG.player.lives,
        invincible: false,
        invincibleTimer: 0
    };
    
    // Создаем платформы
    platforms = [
        {x: 0, y: canvas.height - 150, width: canvas.width, height: 150, type: 'ground', float: false},
        {x: 200, y: canvas.height - 250, width: 180, height: 40, type: 'platform', float: true},
        {x: 450, y: canvas.height - 320, width: 160, height: 40, type: 'platform', float: true},
        {x: 700, y: canvas.height - 400, width: 140, height: 40, type: 'platform', float: true},
        {x: 350, y: canvas.height - 200, width: 120, height: 40, type: 'platform', float: true},
        {x: 600, y: canvas.height - 280, width: 150, height: 40, type: 'platform', float: true}
    ];
    
    platformFloatOffsets = platforms.map(p => ({
        offset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5
    }));
    
    // Создаем подарки
    gifts = [
        {x: 250, y: canvas.height - 290, width: 35, height: 35, collected: false},
        {x: 500, y: canvas.height - 360, width: 35, height: 35, collected: false},
        {x: 750, y: canvas.height - 440, width: 35, height: 35, collected: false},
        {x: 400, y: canvas.height - 240, width: 35, height: 35, collected: false},
        {x: 650, y: canvas.height - 320, width: 35, height: 35, collected: false}
    ];
    
    // Создаем флаг
    flag = {x: canvas.width - 150, y: canvas.height - 450, width: 50, height: 180, reached: false};
    
    // Создаем облака
    clouds = [
        {x: 50, y: 60, width: 120, height: 60},
        {x: 300, y: 90, width: 150, height: 70},
        {x: 600, y: 50, width: 180, height: 80},
        {x: 850, y: 110, width: 130, height: 65}
    ];
    
    // Создаем кусты и цветы
    bushes = [
        {x: 100, y: canvas.height - 180, width: 80, height: 60},
        {x: 400, y: canvas.height - 180, width: 90, height: 65},
        {x: 700, y: canvas.height - 180, width: 70, height: 55}
    ];
    
    flowers = [
        {x: 150, y: canvas.height - 170, width: 25, height: 25},
        {x: 280, y: canvas.height - 170, width: 25, height: 25},
        {x: 450, y: canvas.height - 170, width: 25, height: 25},
        {x: 620, y: canvas.height - 170, width: 25, height: 25},
        {x: 780, y: canvas.height - 170, width: 25, height: 25}
    ];
}

// ===================== ФУНКЦИИ ИГРЫ =====================
function initGame() {
    initGameObjects();
    
    score = 0;
    gameOver = false;
    gameWin = false;
    floatingMessages = [];
    scoreElement.textContent = score;
    livesElement.textContent = player.lives;
    messageElement.style.display = 'none';
    
    loadingElement.style.display = 'none';
    
    gameLoop();
}

function gameLoop() {
    if (gameOver || gameWin) {
        if (gameWin) showWinMessage();
        return;
    }
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -CONFIG.player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight']) {
        player.velocityX = CONFIG.player.speed;
        player.facingRight = true;
    }
    
    if (keys['ArrowUp'] && player.isOnGround) {
        player.velocityY = -CONFIG.player.jumpForce;
        player.isOnGround = false;
        createParticles(player.x + player.width/2, player.y + player.height, 8, '#f1c40f');
    }
    
    player.velocityY += CONFIG.gravity;
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    platforms.forEach((platform, index) => {
        if (platform.float) {
            const floatData = platformFloatOffsets[index];
            floatData.offset += 0.02 * floatData.speed;
            platform.floatOffset = Math.sin(floatData.offset) * 8;
        }
    });
    
    player.isOnGround = false;
    platforms.forEach(platform => {
        const platformY = platform.float ? platform.y + (platform.floatOffset || 0) : platform.y;
        
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platformY &&
            player.y + player.height < platformY + platform.height + player.velocityY) {
            
            player.y = platformY - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
        }
    });
    
    gifts.forEach((gift, index) => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++;
            scoreElement.textContent = score;
            
            createParticles(gift.x + gift.width/2, gift.y + gift.height/2, 15, '#e74c3c');
            showFloatingMessage(giftMessages[index % giftMessages.length], gift.x, gift.y);
            
            if (score === gifts.length) {
                messageElement.textContent = "🎊 Все подарки собраны! Беги к флагу! 🎊";
                messageElement.style.display = 'block';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 2000);
            }
        }
    });
    
    if (!flag.reached &&
        player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y) {
        
        flag.reached = true;
        if (score === gifts.length) {
            gameWin = true;
        } else {
            messageElement.textContent = "Сначала собери все подарки любви! 💝";
            messageElement.style.display = 'block';
            setTimeout(() => {
                messageElement.style.display = 'none';
                flag.reached = false;
            }, 1500);
        }
    }
    
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    for (let i = floatingMessages.length - 1; i >= 0; i--) {
        floatingMessages[i].y -= 2;
        floatingMessages[i].life--;
        
        if (floatingMessages[i].life <= 0) {
            floatingMessages.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#5c94fc');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    clouds.forEach(cloud => {
        ctx.drawImage(sprites.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
    });
    
    platforms.filter(p => p.type === 'ground').forEach(platform => {
        for (let x = platform.x; x < platform.x + platform.width; x += 100) {
            ctx.drawImage(sprites.ground, x, platform.y, 100, platform.height);
        }
    });
    
    platforms.filter(p => p.type === 'platform').forEach(platform => {
        const yPos = platform.float ? platform.y + (platform.floatOffset || 0) : platform.y;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(platform.x + 10, yPos + 10, platform.width, platform.height);
        
        ctx.drawImage(sprites.platform, platform.x, yPos, platform.width, platform.height);
    });
    
    bushes.forEach(bush => {
        ctx.drawImage(sprites.bush, bush.x, bush.y, bush.width, bush.height);
    });
    
    flowers.forEach(flower => {
        ctx.drawImage(sprites.flower, flower.x, flower.y, flower.width, flower.height);
    });
    
    gifts.forEach(gift => {
        if (!gift.collected) {
            const floatOffset = Math.sin(Date.now() / 500) * 8;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(gift.x + gift.width/2, gift.y + gift.height + 5, 
                       gift.width/2, gift.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.drawImage(sprites.gift, gift.x, gift.y + floatOffset, gift.width, gift.height);
        }
    });
    
    ctx.drawImage(sprites.flag, flag.x, flag.y, flag.width, flag.height);
    
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, player.y + player.height + 5, 
                   player.width/3, player.height/8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.save();
        if (!player.facingRight) {
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprites.player, 0, 0, player.width, player.height);
        } else {
            ctx.drawImage(sprites.player, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }
    
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    floatingMessages.forEach(message => {
        ctx.save();
        ctx.globalAlpha = message.life / 100;
        ctx.font = 'bold 24px "Comic Neue", cursive';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 3;
        ctx.strokeText(message.text, message.x, message.y);
        ctx.fillText(message.text, message.x, message.y);
        ctx.restore();
    });
}

function loseLife() {
    if (player.invincible) return;
    
    player.lives--;
    livesElement.textContent = player.lives;
    
    if (player.lives <= 0) {
        gameOver = true;
        showMessage("Попробуй ещё раз, мама верит в тебя! 💪");
    } else {
        player.invincible = true;
        player.invincibleTimer = 120;
        player.x = CONFIG.player.startX;
        player.y = CONFIG.player.startY;
        player.velocityX = 0;
        player.velocityY = 0;
        
        for (let i = 0; i < 25; i++) {
            createParticles(player.x + player.width/2, player.y + player.height/2, 3, '#e74c3c');
        }
    }
}

function showWinMessage() {
    const finalMessages = [
        "🎊 ТЫ СУПЕР-МАМА! 🎊",
        "С Юбилеем, родная!",
        "Ты собрала все подарки любви!",
        "Мы тебя бесконечно любим! 💖",
        "Спасибо за всё! 🌟"
    ];
    
    messageElement.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 2em; color: #FFD700;">${finalMessages[0]}</div>
        <div style="font-size: 1.2em; color: white; line-height: 1.8;">
            ${finalMessages.slice(1).join('<br>')}
        </div>
        <div style="margin-top: 30px; font-size: 0.8em; color: #FFD700;">
            Нажми R или кнопку для новой игры
        </div>
    `;
    messageElement.style.display = 'block';
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                15,
                ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'][Math.floor(Math.random() * 5)]
            );
        }, i * 50);
    }
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

function showFloatingMessage(text, x, y) {
    floatingMessages.push({
        text: text,
        x: x + 15,
        y: y - 20,
        life: 100
    });
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10 - 5,
            life: 30 + Math.random() * 30,
            color: color,
            size: 4 + Math.random() * 6,
            update: function() {
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.velocityY += 0.1;
                this.life--;
                this.size *= 0.95;
            },
            draw: function(ctx) {
                ctx.globalAlpha = this.life / 60;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    }
}

function resetGame() {
    initGame();
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    resizeCanvas();
    initGame();
});
