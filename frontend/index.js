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

class Particle {
    constructor(x, y, radius, colour, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = 0.99;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.aplha;
        ctx.beginPath();
        ctx.arc(this.x , this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha = this.alpha - 0.02;
    }
}

// consts sockets
let socket = io('https://tranquil-everglades-91995.herokuapp.com/', {transports:['websocket', 'polling']});
socket.emit('get_envy', );
var envy = {};

// consts html
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const startGameBtn = document.querySelector('#startGameBtn');
const menuModel = document.querySelector('#menuModel');
const p_input_colour = document.querySelector('#input_p_colour');
const b_input_colour = document.querySelector('#input_b_colour');
const room_id = document.querySelector('#room_id');

// game variables
let room_id_value;
let worldWidth;
let worldHeight;
let border_margin;
let player_r;
let player_s;
let player_health;
let x_mid;
let y_mid;
let player_colour;
let player;
let max_bullets;
let max_dist;
let proj_r;
let proj_s;
let proj_speed;
let proj_colour;
let projectiles;
let players;
let enemy_projectiles;
let particles;

function init(){
    worldWidth = envy.worldWidth;
    worldHeight = envy.worldHeight;
    border_margin = envy.border_margin;
    canvas.width = worldWidth;
    canvas.height = worldHeight;
    player_r = envy.player_r;
    player_s = envy.player_s;
    player_health = envy.player_health;
    x_mid = Math.floor(Math.random() * (canvas.width - player_r*3 - border_margin + 1) + player_r*3);
    y_mid = Math.floor(Math.random() * (canvas.height - player_r*3 - border_margin + 1) + player_r*3);
    player_colour = p_input_colour.value;
    player = new Player(x_mid, y_mid, player_r, player_colour, player_s, player_health);
    max_bullets = envy.max_bullets;
    max_dist = envy.max_dist;
    proj_r = envy.proj_r;
    proj_s = envy.proj_s;
    proj_speed = envy.proj_speed;
    proj_colour = b_input_colour.value;
    projectiles = [];
    players = [];
    enemy_projectiles = [];
    particles = [];
    // send player to the server
    socket.emit('get_player', player, room_id_value);
}

// main loop
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.125)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var check = check_boarder();
    socket.emit('get_player', player, room_id_value);
    for(enemy in players){
        pl = new Player(players[enemy].x, players[enemy].y, players[enemy].radius, players[enemy].colour, players[enemy].speed, players[enemy].health);
        pl.update();
        // enemy hits
        if(enemy_projectiles.length > 0){
            enemy_projectiles.forEach(p =>{
                const dist = Math.hypot(pl.x - p.x, pl.y - p.y);
                if(dist - p.radius - pl.radius < 1){
                    // particles spawn
                    for(let i = 0; i < 8; i++){
                        particles.push(
                            new Particle(
                                p.x, 
                                p.y, 
                                3, 
                                pl.colour, 
                                {
                                    x: Math.random() - 0.5,
                                    y: Math.random() - 0.5,
                                })
                        );
                    }
                    //socket.emit('delete_projectiles', room_id_value);
                    setTimeout(() => {
                        const index = enemy_projectiles.indexOf(p);
                        enemy_projectiles.splice(index, 1);
                    }, 0)
                }
            });
        }
        projectiles.forEach(projectile =>{
            const dist = Math.hypot(pl.x - projectile.x, pl.y - projectile.y);
                if(dist - projectile.radius - pl.radius < 1){
                     // particles spawn
                     for(let i = 0; i < 8; i++){
                        particles.push(
                            new Particle(
                                projectile.x, 
                                projectile.y, 
                                3, 
                                pl.colour, 
                                {
                                    x: Math.random() - 0.5,
                                    y: Math.random() - 0.5,
                                })
                        );
                    }
                    //socket.emit('delete_projectiles', room_id_value);
                    setTimeout(() => {
                        const index = projectiles.indexOf(projectile);
                        projectiles.splice(index, 1);
                    }, 0)
                }
        });
    }
    player.update();
    //camera_auto_scroll(player.dir); //?
    // enemy projectiles managment
    if(enemy_projectiles.length > 0){
        enemy_projectiles.forEach(p =>{
            p.update();
            // delete projectile of dist
            if(p.dist >= p.max_dist){
                //socket.emit('delete_projectiles', room_id_value);
                setTimeout(() => {
                    const index = enemy_projectiles.indexOf(p);
                    enemy_projectiles.splice(index, 1);
                }, 0)
            }
            // hits on players from enemies
            const dist = Math.hypot(player.x - p.x, player.y - p.y);
            if(dist - p.radius - player.radius < 1){
                // particles spawn
                for(let i = 0; i < 8; i++){
                    particles.push(
                        new Particle(
                            p.x, 
                            p.y, 
                            3, 
                            player.colour, 
                            {
                                x: Math.random() - 0.5,
                                y: Math.random() - 0.5,
                            })
                    );
                }
                //socket.emit('delete_projectiles', room_id_value);
                setTimeout(() => {
                    const index = enemy_projectiles.indexOf(p);
                    enemy_projectiles.splice(index, 1);
                }, 0)
                // player health management
                player.health = player.health - 1;
                const decrease = player.radius / (player.health+3);
                if(player.radius - decrease > 0){
                    player.radius = player.radius - decrease;
                }
            }
        });
    }
    // players projectiles managment
    projectiles.forEach(projectile =>{
        projectile.update();
        // delete projectile of dist
        if(projectile.dist >= projectile.max_dist){
            socket.emit('delete_projectiles', room_id_value);
            setTimeout(() => {
                const index = projectiles.indexOf(projectile);
                projectiles.splice(index, 1);
            }, 0)
        }
        // hits from player to itself
        const dist = Math.hypot(player.x - projectile.x, player.y - projectile.y);
            if(dist - projectile.radius - player.radius < 1){
                // particles spawn
                for(let i = 0; i < 8; i++){
                    particles.push(
                        new Particle(
                            projectile.x, 
                            projectile.y, 
                            3, 
                            player.colour, 
                            {
                                x: Math.random() - 0.5,
                                y: Math.random() - 0.5,
                            })
                    );
                }
                socket.emit('delete_projectiles', room_id_value);
                setTimeout(() => {
                    const index = projectiles.indexOf(projectile);
                    projectiles.splice(index, 1);
                }, 0)
                // player health management
                take_damage(player);
            }
    });
    // check projectiles
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        }else{
            particle.update()
        }
    });
    // player death
    if(player.health <= 0){
        socket.emit('get_player', player, room_id_value);
        console.log('Died!');
        cancelAnimationFrame(animationId);
        menuModel.style.display = 'flex';
    }
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
            {
                x: velocity.x*proj_speed, 
                y: velocity.y*proj_speed
            },
            max_dist,
        );
        socket.emit('get_projectiles', p, room_id_value);
        projectiles.push(p);
    }
})

// 2. movements
canvas.addEventListener('keydown', (event) => {
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
canvas.addEventListener("mousedown", e => {
    if(e.button == 1){
        isDown = true;
        startX = player.x;
        startY = player.y;
    }
});
canvas.addEventListener("mouseleave", () => {
    isDown = false;
});
canvas.addEventListener("mouseup", () => {
    isDown = false;
});
canvas.addEventListener("mousemove", e => {
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
        return;
    }
    if (typeof data[1].x == 'undefined'){
        return;
    }
    p = new Projectile(data[1].x, data[1].y, data[1].radius, data[1].colour, data[1].velocity, data[1].max_dist);
    enemy_projectiles.push(p);
}

socket.on('receive_envy', receive_envy);
function receive_envy(data){
    envy = data;
}

// html input
startGameBtn.addEventListener('click', () => {
    room_id_value =  room_id.value;
    socket.emit('new_game', room_id_value);
    menuModel.style.display = 'none';
    // start game
    init();
    scroll_to_center();
    animate();
});
