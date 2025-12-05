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
        groundLevel: 300,
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
const floatingMessagesContainer = document.getElementById('floatingMessages');

// Устанавливаем размер canvas 70% от экрана
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Сохраняем пропорции 16:9
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
    
    // Масштабируем игровой мир
    scaleX = width / 1200; // Базовый размер мира
    scaleY = height / 675;
    currentScale = Math.min(scaleX, scaleY);
}

// Масштаб для адаптивности
let scaleX = 1, scaleY = 1, currentScale = 1;

// Массив приятных сообщений
const giftMessages = [
    "Ты самая добрая! 💖",
    "Твоя улыбка светит ярче солнца! ☀️",
    "Ты всегда поддерживаешь! 🤗",
    "Ты мой главный пример! 👑",
    "Я тебя очень люблю! ❤️",
    "Ты делаешь мир лучше! ✨",
    "Твои объятия - самый уютный дом! 🏡",
    "Ты самая мудрая! 🦉",
    "Ты вдохновляешь меня! 🎯",
    "Ты прекрасная мама! 🌸"
];

// Загрузка изображений
const images = {
    player: new Image(),
    ground: new Image(),
    platform: new Image(),
    gift: new Image(),
    flag: new Image(),
    cloud: new Image(),
    bush: new Image(),
    flower: new Image()
};

// Источники изображений
images.player.src = 'images/mama.png';
images.ground.src = 'images/ground.png';
images.platform.src = 'images/platform.png';
images.gift.src = 'images/gift.png';
images.flag.src = 'images/flag.png';
images.cloud.src = 'images/cloud.png';
images.bush.src = 'images/bush.png';
images.flower.src = 'images/flower.png';

let imagesLoaded = 0;
const totalImages = Object.keys(images).length;
let allImagesLoaded = false;

// Проверка загрузки изображений
Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загружено ${imagesLoaded}/${totalImages}...</p>
        `;
        
        if (imagesLoaded === totalImages) {
            allImagesLoaded = true;
            setTimeout(() => {
                loadingElement.style.display = 'none';
                resizeCanvas();
                initGame();
            }, 500);
        }
    };
    
    img.onerror = () => {
        console.error(`Ошибка загрузки: ${img.src}`);
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            allImagesLoaded = true;
            loadingElement.style.display = 'none';
            resizeCanvas();
            initGame();
        }
    };
});

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
    if (allImagesLoaded) {
        resizeCanvas();
    }
});

restartButton.addEventListener('click', resetGame);

// ===================== ФУНКЦИИ ИГРЫ =====================
function initGame() {
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
    
    // Создаем платформы (парящие острова)
    platforms = [
        // Основная земля
        {x: 0, y: canvas.height - 150, width: canvas.width, height: 150, type: 'ground', float: false},
        // Плавающие острова
        {x: 200, y: canvas.height - 250, width: 180, height: 40, type: 'platform', float: true},
        {x: 450, y: canvas.height - 320, width: 160, height: 40, type: 'platform', float: true},
        {x: 700, y: canvas.height - 400, width: 140, height: 40, type: 'platform', float: true},
        {x: 350, y: canvas.height - 200, width: 120, height: 40, type: 'platform', float: true},
        {x: 600, y: canvas.height - 280, width: 150, height: 40, type: 'platform', float: true},
        {x: 850, y: canvas.height - 350, width: 130, height: 40, type: 'platform', float: true}
    ];
    
    // Инициализируем смещения для парящих платформ
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
    flag = {x: 900, y: canvas.height - 450, width: 50, height: 180, reached: false};
    
    // Создаем облака
    clouds = [
        {x: 50, y: 60, width: 120, height: 60},
        {x: 300, y: 90, width: 150, height: 70},
        {x: 600, y: 50, width: 180, height: 80},
        {x: 850, y: 110, width: 130, height: 65},
        {x: 1100, y: 80, width: 140, height: 75}
    ];
    
    // Создаем кусты и цветы на земле
    bushes = [
        {x: 100, y: canvas.height - 180, width: 80, height: 60},
        {x: 400, y: canvas.height - 180, width: 90, height: 65},
        {x: 700, y: canvas.height - 180, width: 70, height: 55},
        {x: 1000, y: canvas.height - 180, width: 85, height: 62}
    ];
    
    flowers = [
        {x: 150, y: canvas.height - 170, width: 25, height: 25},
        {x: 280, y: canvas.height - 170, width: 25, height: 25},
        {x: 450, y: canvas.height - 170, width: 25, height: 25},
        {x: 620, y: canvas.height - 170, width: 25, height: 25},
        {x: 780, y: canvas.height - 170, width: 25, height: 25},
        {x: 950, y: canvas.height - 170, width: 25, height: 25}
    ];
    
    // Сброс состояния
    score = 0;
    gameOver = false;
    gameWin = false;
    floatingMessages = [];
    scoreElement.textContent = score;
    livesElement.textContent = player.lives;
    messageElement.style.display = 'none';
    floatingMessagesContainer.innerHTML = '';
    
    // Запуск игрового цикла
    gameLoop();
}

function gameLoop() {
    if (gameOver || gameWin) {
        if (gameWin) {
            showWinMessage();
        }
        return;
    }
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Управление
    player.velocityX = 0;
    if (keys['ArrowLeft']) {
        player.velocityX = -CONFIG.player.speed;
        player.facingRight = false;
    }
    if (keys['ArrowRight']) {
        player.velocityX = CONFIG.player.speed;
        player.facingRight = true;
    }
    
    // Прыжок
    if (keys['ArrowUp'] && player.isOnGround) {
        player.velocityY = -CONFIG.player.jumpForce;
        player.isOnGround = false;
        createParticles(player.x + player.width/2, player.y + player.height, 8, '#f1c40f');
    }
    
    // Гравитация
    player.velocityY += CONFIG.gravity;
    
    // Обновление позиции
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Границы экрана (с прокруткой)
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Прокрутка камеры
    if (player.x > canvas.width * 0.6) {
        const scrollAmount = player.x - canvas.width * 0.6;
        player.x = canvas.width * 0.6;
        
        // Прокручиваем все объекты
        platforms.forEach(p => p.x -= scrollAmount * 0.7);
        gifts.forEach(g => g.x -= scrollAmount * 0.7);
        flag.x -= scrollAmount * 0.7;
        clouds.forEach(c => c.x -= scrollAmount * 0.3);
        bushes.forEach(b => b.x -= scrollAmount * 0.7);
        flowers.forEach(f => f.x -= scrollAmount * 0.7);
    }
    
    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
        return;
    }
    
    // Анимация парящих платформ
    platforms.forEach((platform, index) => {
        if (platform.float) {
            const floatData = platformFloatOffsets[index];
            floatData.offset += 0.02 * floatData.speed;
            platform.floatOffset = Math.sin(floatData.offset) * 5;
        }
    });
    
    // Столкновение с платформами
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
    
    // Сбор подарков
    gifts.forEach((gift, index) => {
        if (!gift.collected &&
            player.x < gift.x + gift.width &&
            player.x + player.width > gift.x &&
            player.y < gift.y + gift.height &&
            player.y + player.height > gift.y) {
            
            gift.collected = true;
            score++;
            scoreElement.textContent = score;
            
            // Эффект сбора
            createParticles(gift.x + gift.width/2, gift.y + gift.height/2, 15, '#e74c3c');
            
            // Показываем приятное сообщение
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
    
    // Достижение флага
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
    
    // Обновление невидимости
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // Обновление частиц
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Обновление плавающих сообщений
    for (let i = floatingMessages.length - 1; i >= 0; i--) {
        floatingMessages[i].y -= 2;
        floatingMessages[i].life--;
        
        if (floatingMessages[i].life <= 0) {
            floatingMessages.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон (градиент небо)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#5c94fc');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Облака
    clouds.forEach(cloud => {
        ctx.drawImage(images.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
    });
    
    // Земля
    platforms.filter(p => p.type === 'ground').forEach(platform => {
        // Текстура земли
        for (let x = platform.x; x < platform.x + platform.width; x += images.ground.width) {
            ctx.drawImage(images.ground, x, platform.y, images.ground.width, platform.height);
        }
    });
    
    // Платформы (парящие острова)
    platforms.filter(p => p.type === 'platform').forEach(platform => {
        const yPos = platform.float ? platform.y + (platform.floatOffset || 0) : platform.y;
        
        // Тень под платформой
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x + 5, yPos + 5, platform.width, platform.height);
        
        // Платформа
        for (let x = platform.x; x < platform.x + platform.width; x += images.platform.width) {
            const width = Math.min(images.platform.width, platform.x + platform.width - x);
            ctx.drawImage(images.platform, 0, 0, width, images.platform.height, 
                         x, yPos, width, platform.height);
        }
    });
    
    // Кусты на земле
    bushes.forEach(bush => {
        ctx.drawImage(images.bush, bush.x, bush.y, bush.width, bush.height);
    });
    
    // Цветы на земле
    flowers.forEach(flower => {
        ctx.drawImage(images.flower, flower.x, flower.y, flower.width, flower.height);
    });
    
    // Подарки
    gifts.forEach(gift => {
        if (!gift.collected) {
            // Анимация парения
            const floatOffset = Math.sin(Date.now() / 500) * 5;
            
            // Тень
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(gift.x + gift.width/2, gift.y + gift.height + 3, 
                       gift.width/2, gift.height/6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Подарок
            ctx.drawImage(images.gift, gift.x, gift.y + floatOffset, gift.width, gift.height);
            
            // Свечение
            if (Math.sin(Date.now() / 200) > 0) {
                ctx.shadowColor = '#ff4081';
                ctx.shadowBlur = 15;
                ctx.drawImage(images.gift, gift.x, gift.y + floatOffset, gift.width, gift.height);
                ctx.shadowBlur = 0;
            }
        }
    });
    
    // Флаг
    ctx.drawImage(images.flag, flag.x, flag.y, flag.width, flag.height);
    
    // Анимация флага
    if (flag.reached) {
        ctx.save();
        ctx.translate(flag.x + flag.width, flag.y + 100);
        ctx.rotate(Math.sin(Date.now() / 300) * 0.5);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(60, -40);
        ctx.lineTo(0, -80);
        ctx.fill();
        ctx.restore();
    }
    
    // Игрок
    if (!player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
        // Тень под игроком
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, player.y + player.height + 5, 
                   player.width/3, player.height/8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.save();
        if (!player.facingRight) {
            ctx.translate(player.x + player.width, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(images.player, 0, 0, player.width, player.height);
        } else {
            ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }
    
    // Частицы
    particles.forEach(particle => {
        particle.draw(ctx);
    });
    
    // Плавающие сообщения
    floatingMessages.forEach(message => {
        ctx.save();
        ctx.globalAlpha = message.life / 100;
        ctx.font = 'bold 24px "Comic Neue", cursive';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 4;
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
        
        // Эффект потери жизни
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
    
    // Фейерверк
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                15,
                ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'][Math.floor(Math.random() * 5)]
            );
        }, i * 100);
    }
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

function showFloatingMessage(text, x, y) {
    floatingMessages.push({
        text: text,
        x: x,
        y: y,
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
    
    // Если изображения не загрузились за 5 секунд, покажем ошибку
    setTimeout(() => {
        if (!allImagesLoaded) {
            loadingElement.innerHTML = `
                <p style="color: #ff6b6b;">Ошибка загрузки изображений</p>
                <p style="font-size: 0.8em; margin-top: 10px;">
                    Проверьте папку images или используйте готовые спрайты
                </p>
                <button onclick="location.reload()" class="pixel-button" 
                        style="margin-top: 20px; padding: 10px 20px;">
                    Перезагрузить
                </button>
            `;
        }
    }, 5000);
});
