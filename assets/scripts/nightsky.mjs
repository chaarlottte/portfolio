window.onload = function() {
    setTimeout(init, 200);
};

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

const layers = [
    { speed: 0.015, scale: 0.2, count: 320 },
    { speed: 0.03, scale: 0.5, count: 50 },
    { speed: 0.05, scale: 0.75, count: 30 }
];
const shootingStarSpeed = {
    min: 15,
    max: 20
};
const stars = [];
const shootingStars = [];

const shootingStarOpacityDelta = 0.01;
const trailLengthDelta = 0.01;
const shootingStarEmittingInterval = 1000;
const shootingStarLifeTime = 500;
const maxTrailLength = 300;
const starBaseRadius = 2;
const shootingStarRadius = 3;
const starsAngle = 145;

class Particle {
    constructor(x, y, speed, direction) {
        this.x = x;
        this.y = y;
        this.vx = -Math.cos(direction) * speed;
        this.vy = Math.sin(direction) * speed;
        this.radius = 0;
    }

    getSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    setSpeed(speed) {
        let heading = this.getHeading();
        this.vx = -Math.cos(heading) * speed;
        this.vy = Math.sin(heading) * speed;
    }

    getHeading() {
        return Math.atan2(this.vy, this.vx);
    }

    setHeading(heading) {
        let speed = this.getSpeed();
        this.vx = -Math.cos(heading) * speed;
        this.vy = Math.sin(heading) * speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}


function lineToAngle(x1, y1, length, radians) {
    let x2 = x1 + length * Math.cos(radians),
        y2 = y1 + length * Math.sin(radians);
    return { x: x2, y: y2 };
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function degreesToRads(degrees) {
    return degrees / 180 * Math.PI;
}

function createShootingStar() {
    let shootingStar = new Particle(randomRange(0, width), 0, 0, 0);
    shootingStar.setSpeed(randomRange(shootingStarSpeed.min, shootingStarSpeed.max));
    shootingStar.setHeading(degreesToRads(starsAngle));
    shootingStar.radius = shootingStarRadius;
    shootingStar.opacity = 0;
    shootingStar.trailLengthDelta = 0;
    shootingStar.isSpawning = true;
    shootingStar.isDying = false;
    shootingStars.push(shootingStar);
}

function killShootingStar(shootingStar) {
    setTimeout(() => {
        shootingStar.isDying = true;
    }, shootingStarLifeTime);
}

function drawStar(star) {
    context.fillStyle = "rgb(255, 221, 157)";
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
    context.fill();
}

function drawShootingStar(p) {
    let x = p.x,
        y = p.y,
        currentTrailLength = (maxTrailLength * p.trailLengthDelta),
        pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());

    context.fillStyle = "rgba(255, 255, 255, " + p.opacity + ")";
    let starLength = 5;
    context.beginPath();
    context.moveTo(x - 1, y + 1);

    context.lineTo(x, y + starLength);
    context.lineTo(x + 1, y + 1);

    context.lineTo(x + starLength, y);
    context.lineTo(x + 1, y - 1);

    context.lineTo(x, y + 1);
    context.lineTo(x, y - starLength);

    context.lineTo(x - 1, y - 1);
    context.lineTo(x - starLength, y);

    context.lineTo(x - 1, y + 1);
    context.lineTo(x - starLength, y);

    context.closePath();
    context.fill();

    context.fillStyle = "rgba(255, 221, 157, " + p.opacity + ")";
    context.beginPath();
    context.moveTo(x - 1, y - 1);
    context.lineTo(pos.x, pos.y);
    context.lineTo(x + 1, y + 1);
    context.closePath();
    context.fill();
}

function update() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#282a3a";
    context.fillRect(0, 0, width, height);
    context.fill();

    for (let i = 0; i < stars.length; i += 1) {
        let star = stars[i];
        star.update();
        drawStar(star);

        if(star.x > width) 
            star.x = 0;

        if(star.x < 0) 
            star.x = width;

        if(star.y > height) 
            star.y = 0;
        
        if(star.y < 0) 
            star.y = height;
    }

    for (let i = 0; i < shootingStars.length; i += 1) {
        let shootingStar = shootingStars[i];
        if(shootingStar.isSpawning) {
            shootingStar.opacity += shootingStarOpacityDelta;
            if(shootingStar.opacity >= 1.0) {
                shootingStar.isSpawning = false;
                killShootingStar(shootingStar);
            }
        }
        if(shootingStar.isDying) {
            shootingStar.opacity -= shootingStarOpacityDelta;
            if(shootingStar.opacity <= 0.0) {
                shootingStar.isDying = false;
                shootingStar.isDead = true;
            }
        }
        shootingStar.trailLengthDelta += trailLengthDelta;

        shootingStar.update();
        if(shootingStar.opacity > 0.0)
            drawShootingStar(shootingStar);
    }

    for (let i = shootingStars.length -1; i >= 0 ; i--){
        if(shootingStars[i].isDead){
            shootingStars.splice(i, 1);
        }
    }

    // document.body.style.background = `url(${canvas.toDataURL()})`;
    requestAnimationFrame(update);
}

function init() {

    // Create background stars
    for (let j = 0; j < layers.length; j += 1) {
        let layer = layers[j];
        for(let i = 0; i < layer.count; i += 1) {
            let star = new Particle(randomRange(0, width), randomRange(0, height), 0, 0);
            star.radius = starBaseRadius * layer.scale;
            star.setSpeed(layer.speed);
            star.setHeading(degreesToRads(starsAngle));
            stars.push(star);
        }
    }

    update();

    setInterval(() => {
        createShootingStar();
    }, shootingStarEmittingInterval);

}