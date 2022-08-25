class Player {
    constructor(x, y, radius, colour, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.speed = speed;
        this.dir = ''
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }

    update() {
        this.draw();
        if(this.dir == 'a'){
            player.x = player.x - player.speed;
        }
        if(this.dir== 'd'){
            player.x = player.x + player.speed;
        }
        if(this.dir == 'w'){
            player.y = player.y - player.speed
        }
        if(this.dir == 's'){
            player.y = player.y + player.speed
        }
    }
}

class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
        this.start_x = x;
        this.start_y = y;
        this.dist = 0;
        this.max_dist = 600;
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
        this.dist = Math.sqrt( (this.x - this.start_x)**2 + (this.y - this.start_y)**2 );
    }
}

// consts
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const worldWidth = 2000;
const worldHeight = 2000;
const border_margin = 10;
canvas.width = worldWidth;
canvas.height = worldHeight;
const socket = io('http://localhost:3000');
const player_r = 30;
const x_mid = Math.floor(Math.random() * (canvas.width - player_r*3 + 1) + player_r*3);
const y_mid = Math.floor(Math.random() * (canvas.height - player_r*3 + 1) + player_r*3);
const player = new Player(x_mid, y_mid, player_r, 'blue', 3);
const max_bullets = 5;
const projectiles = [];
var players = [];

// send player to the server
socket.emit('get_player', player);

// main loop
function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var check = check_boarder();
    player.update();
    //camera_auto_scroll(player.dir);
    projectiles.forEach(projectile =>{
        projectile.update();
        if(projectile.dist >= projectile.max_dist){
            const index = projectiles.indexOf(projectile);
            projectiles.splice(index, 1);
        }
    });
}

// helpers

// 1. locate player in the center
function scroll_to_center(){
    window.scrollTo({
        top: player.y / 2,
        left: player.x / 2,
        behavior: "smooth"
    });
}

// 2. check boarders
function check_boarder(){
    // right
    if(player.x - player.radius - border_margin <= 0 && player.dir == 'a'){
        player.dir = '';
        return 1;
    }
    // left
    if(player.x + player.radius + border_margin >= worldWidth && player.dir == 'd'){
        player.dir = '';
        return 1;
    }
    // top
    if(player.y - player.radius - border_margin <= 0 && player.dir == 'w'){
        player.dir = '';
        return 1;
    }
    // bottom
    if(player.y + player.radius + border_margin >= worldHeight && player.dir == 's'){
        player.dir = '';
        return 1;
    }
    return 0;
}

// controlls
// 1. attack on right click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const angle = Math.atan2(y - player.y, x- player.x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    }
    if(projectiles.length <= max_bullets){
        projectiles.push(new Projectile(
            player.x + velocity.x*player.radius + velocity.x*5,
            player.y + velocity.y*player.radius + velocity.y*5,
            5, 
            'red', 
            velocity,
        ));
    }
})

// 2. movements
window.addEventListener('keydown', (event) => {
    if(event.key.toLowerCase() == 'a'){
        player.dir = 'a';
    }
    if(event.key.toLowerCase() == 'd'){
        player.dir = 'd';
    }
    if(event.key.toLowerCase() == 'w'){
        player.dir = 'w';
    }
    if(event.key.toLowerCase() == 's'){
        player.dir = 's';
    }
    if(event.key.toLowerCase() == 'v'){ // stop
        player.dir = '';
    }
})

// 3. middle mouse to scroll canvas relatively to player
let isDown = false;
let startX;
let startY;
let scrollLeft;
window.addEventListener("mousedown", e => {
    if(e.button == 1){
        isDown = true;
        startX = player.x;
        startY = player.y;
    }
});
window.addEventListener("mouseleave", () => {
    isDown = false;
});
window.addEventListener("mouseup", () => {
    isDown = false;
});
window.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const walkX = -e.clientX + startX;
    const walkY = -e.clientY + startY;
    window.scrollTo({
        top: walkY,
        left: walkX,
        behavior: "smooth"
    });
});

// socket functions
socket.on('init', handleInit);
function handleInit(msg){
    console.log(msg);
}

socket.on('receive_players', receive_players);
function receive_players(data){
    players = data;
    console.log(players);
}

// start game
scroll_to_center()
animate();