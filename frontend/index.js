class Player {
    constructor(x, y, radius, colour, speed, player_health) {
        this.x = x;
        this.y = y;
        this.health = player_health;
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
    constructor(x, y, radius, colour, velocity, max_dist) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
        this.start_x = x;
        this.start_y = y;
        this.dist = 0;
        this.max_dist = max_dist;  // get from server
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
const socket = io('http://localhost:3000');
socket.emit('get_envy', ); // ?
var envy = {}; // ?

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const worldWidth = 800;  // get from server
const worldHeight = 800;  // get from server
const border_margin = 10;  // get from server
canvas.width = worldWidth;
canvas.height = worldHeight;
const player_r = 30;  // get from server
const player_s = 3;  // get from server
const player_health = 10;  // get from server
const x_mid = Math.floor(Math.random() * (canvas.width - player_r*3 - border_margin + 1) + player_r*3);
const y_mid = Math.floor(Math.random() * (canvas.height - player_r*3 - border_margin + 1) + player_r*3);
const player_colour = 'blue'; // input
const player = new Player(x_mid, y_mid, player_r, player_colour, player_s, player_health);
const max_bullets = 5; // get from server
const max_dist = 600; // get from server
const proj_r = 5; // get from server
const proj_s = 5; // get from server
const proj_colour = 'red';
const projectiles = [];
var players = [];
const enemy_projectiles = []

// send player to the server
socket.emit('get_player', player);

// main loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var check = check_boarder();
    socket.emit('get_player', player);
    for(enemy in players){
        p = new Player(players[enemy].x, players[enemy].y, players[enemy].radius, players[enemy].colour, players[enemy].speed, players[enemy].player_health);
        p.update();
    }
    player.update();
    //camera_auto_scroll(player.dir); //?
    if(enemy_projectiles.length > 0){
        enemy_projectiles.forEach(p =>{
            p.update();
            if(p.dist >= p.max_dist){
                setTimeout(() => {
                    const index = enemy_projectiles.indexOf(p);
                    enemy_projectiles.splice(index, 1);
                }, 0)
            }
            const dist = Math.hypot(player.x - p.x, player.y - p.y);
            if(dist - p.radius - player.radius < 1){
                setTimeout(() => {
                    const index = enemy_projectiles.indexOf(p);
                    enemy_projectiles.splice(index, 1);
                }, 0)
                player.health = player.health - 1;
                console.log(player.health);
            }
            if(player.health <= 0){
                console.log('Died!');
            }
        });
    }
    projectiles.forEach(projectile =>{
        projectile.update();
        if(projectile.dist >= projectile.max_dist){
            setTimeout(() => {
                const index = projectiles.indexOf(projectile);
                projectiles.splice(index, 1);
            }, 0)
        }
        const dist = Math.hypot(player.x - projectile.x, player.y - projectile.y);
            if(dist - projectile.radius - player.radius < 1){
                setTimeout(() => {
                    const index = projectiles.indexOf(projectile);
                    projectiles.splice(index, 1);
                }, 0)
                player.health = player.health - 1;
                console.log(player.health);
            }
            if(player.health <= 0){
                console.log('Died!');
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
        const p = new Projectile(
            player.x + velocity.x*(player.radius+2) + velocity.x*proj_s,
            player.y + velocity.y*(player.radius+2) + velocity.y*proj_s,
            proj_r, 
            proj_colour, 
            velocity,
            max_dist,
        );
        socket.emit('get_projectiles', p);
        projectiles.push(p);
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
    players = data[0];
}

socket.on('receive_projectiles', receive_projectiles);
function receive_projectiles(data){
    if(data[1] == null){
        return
    }
    if (typeof data[1].x == 'undefined'){
        return
    }
    p = new Projectile(data[1].x, data[1].y, data[1].radius, data[1].colour, data[1].velocity, data[1].max_dist);
    enemy_projectiles.push(p);
}

socket.on('receive_envy', receive_envy);
function receive_envy(data){
    envy = data;
}

// start game
scroll_to_center()
animate();