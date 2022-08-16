const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');


canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const x_mid = canvas.width / 2;
const y_mid = canvas.height / 2;
const player = new Player(x_mid, y_mid, 30, 'blue', 10);

const projectiles = [];

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.draw();
    projectiles.forEach(projectile =>{
        projectile.update();
    })
}

// window???
window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - player.y, 
                            event.clientX - player.x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    }
    var dir_x = 0
    projectiles.push(new Projectile(
        player.x,
        player.y,
        5, 
        'red', 
        velocity,
    ));
})


animate()