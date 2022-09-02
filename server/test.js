class Room{
    constructor(id){
        this.id = id;
        this.players = {};
        this.projectiles = {};
    }
}

// constants
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// init server
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:8080",
    }
});

// consts for environment
const envy = {
    worldWidth: 2000,
    worldHeight: 2000,
    border_margin: 10,
    player_r: 30,
    player_s: 3,
    player_health: 10,
    max_bullets: 15,
    max_dist: 600,
    proj_r: 5,
    proj_s: 5,
    proj_speed: 3
} 

// consts for managing players and projectiles
var players = {};
var projectiles = {};
var client_rooms = {};


// server functions
io.on('connection', (socket) => {

    socket.emit('init', {data: 'Connected!'}); // change!

    socket.on('new_game', (room_id) => {
        if (typeof(client_rooms[room_id]) == "undefined"){
            client_rooms[room_id] = [socket.id]
        }else{
            client_rooms[room_id].push(socket.id)
        }
        console.log(client_rooms[room_id])
    });

    // get envy
    socket.on('get_envy', () => {
        socket.emit('receive_envy', envy);
    });

    // send players
    socket.on('get_player', (player, room_id) => {
        players[socket.id] = player;
        socket.emit('receive_players', uniq_players(socket.id));
        if(player.health <= 1){
            delete players[socket.id];
        }
        for(var key in players){
            if(socket.id != key){
                io.to(key).emit('receive_players', uniq_players(key));
            }
        }
    });

    // send projectiles
    socket.on('get_projectiles', (projectile, room_id) => {
        projectiles[socket.id] = projectile;
        socket.emit('receive_projectiles', uniq_players(socket.id));

        for(var key in players){
            if(socket.id != key){
                io.to(key).emit('receive_projectiles', uniq_players(key));
            }
        }
        
    });

    // delete projectiles
    socket.on('get_projectiles', (room_id) => {
        delete projectiles[socket.id];
        socket.emit('receive_projectiles', uniq_players(socket.id));

        for(var key in players){
            if(socket.id != key){
                io.to(key).emit('receive_projectiles', uniq_players(key));
            }
        }
        
    });

    // disconnect
    socket.on('disconnect', (player) => {
        //socket.id
        for (const [key, value] of Object.entries(client_rooms)) {
            for(var i = 0; value.length; i++){
                if(socket.id == value[i]){
                    console.log(1)
                    delete client_rooms[key].splice(client_rooms[key].indexOf(value), 1)
                }
            }
        }
        //console.log(client_rooms)
        delete players[socket.id];
        console.log(players)
        for(var key in players){
            io.to(key).emit('receive_players', uniq_players(key));
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running!');
});

// helpers
function uniq_players(id){
    var n_players = {}
    var n_projectiles = []
    for(player in players){
        if(player != id){
            n_players[player] = players[player];
            n_projectiles = projectiles[player];
        }
    }
    return [n_players, n_projectiles];
}