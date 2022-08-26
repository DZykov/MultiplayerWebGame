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
        //methods: ['GET', 'POST'],
    }
});

// consts for environment
const envy = {
    worldWidth: 2000,
    worldHeight: 2000,
    border_margin: 10,
    player_r: 30,
    player_s: 3,
    max_bullets: 5,
    max_dist: 600,
    proj_r: 5,
    proj_s: 5
} 

// consts for managing players and projectiles
var players = {};
var projectiles = {};


// server functions
// 1. connect
io.on('connection', (socket) => {
    socket.emit('init', {data: 'hello!'}); // change!

    // get envy
    socket.on('get_envy', () => {
        socket.emit('receive_envy', envy);
    });

    // send players
    socket.on('get_player', (player) => {
        players[socket.id] = player;
        socket.emit('receive_players', uniq_players(socket.id));
        for(var key in players){
            if(socket.id != key){
                io.to(key).emit('receive_players', uniq_players(key));
            }
        }
    });

    // send projectiles
    socket.on('get_projectiles', (projectile) => {
        projectiles[socket.id] = projectile;
        socket.emit('receive_projectiles', uniq_players(socket.id));

        for(var key in players){
            if(socket.id != key){
                io.to(key).emit('receive_projectiles', uniq_players(key));
            }
        }
        
    });

    // delete projectiles
    socket.on('get_projectiles', () => {
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
        delete players[socket.id];
        for(var key in players){
            io.to(key).emit('receive_players', uniq_players(key));
        }
    });
});

server.listen(3000, () => {
    console.log('Server running!');
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