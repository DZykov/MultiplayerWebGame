const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, colour, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.speed = speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }
}

const x_mid = canvas.width / 2;
const y_mid = canvas.height / 2;

const player = new Player(x_mid, y_mid, 30, 'blue', 10);
player.draw();