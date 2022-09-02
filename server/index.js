class Room{
    constructor(id){
        this.id = id;
        this.players = {};
        this.projectiles = {};
    }

    delete_player(id){
        delete this.players[id];
    }

    add_player(id, player){
        this.players[id] = player;
    }

    delete_projectile(id){
        delete this.projectiles[id];
    }

    add_projectile(id, projectile){
        this.projectiles[id] = projectile;
    }

    get_players_except(id){
        var lst = [];
        for(let key in this.players){
            if(key != id){
                lst.push(this.players[key]);
            }
        }
        var lst_p = this.get_projectiles_except(id);
        return [lst, lst_p];
    }

    get_projectiles_except(id){
        let lst;
        for(let key in this.projectiles){
            if(key != id){
                lst = this.projectiles[key];
            }
        }
        return lst;
    }
}

// constants
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io')(server, {cors: {origin: "*"}});;

// init server
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://stirring-buttercream-cf7454.netlify.app/",
        "Access-Control-Allow-Origin": "https://stirring-buttercream-cf7454.netlify.app/"
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
    proj_speed: 4
} 

// consts for managing players and projectiles
var client_rooms = {};
var ids_to_rooms = {};


// server functions
io.on('connection', (socket) => {

    socket.emit('init', {data: 'Connected!'}); // change!

    socket.on('new_game', (room_id) => {
        room = new Room(room_id);
        client_rooms[room_id] = room;
        ids_to_rooms[socket.id] = room_id;
    });

    // get envy
    socket.on('get_envy', () => {
        socket.emit('receive_envy', envy);
    });

    // send players
    socket.on('get_player', (player, room_id) => {
        if (typeof client_rooms[room_id] == 'undefined'){
            return;
        }
        // add player to room and inform
        client_rooms[room_id].add_player(socket.id, player);
        socket.emit('receive_players', client_rooms[room_id].get_players_except(socket.id));
        socket.emit('receive_projectiles', client_rooms[room_id].get_players_except(socket.id));
        // check for deletion
        if(player.health <= 0){
            client_rooms[room_id].delete_player(socket.id);
        }
        // send new info to anyone except themselves
        for(var key in client_rooms[room_id].players){
            if(socket.id != key){
                io.to(key).emit('receive_players', client_rooms[room_id].get_players_except(key));
                io.to(key).emit('receive_projectiles', client_rooms[room_id].get_players_except(key));
            }
        }
        client_rooms[room_id].delete_projectile(socket.id)
    });
 
    // send projectiles
    socket.on('get_projectiles', (projectile, room_id) => {
        if (typeof client_rooms[room_id] == 'undefined'){
            return;
        }
        // add projectile to room and inform
        client_rooms[room_id].add_projectile(socket.id, projectile);
        socket.emit('receive_projectiles', client_rooms[room_id].get_players_except(socket.id));
        // send new info to everyone except themselves
        for(var key in client_rooms[room_id].projectiles){
            if(socket.id != key){
                io.to(key).emit('receive_projectiles', client_rooms[room_id].get_players_except(key));
            }
        }
    });

    // delete projectiles
    socket.on('delete_projectiles', (room_id) => {
        if (typeof client_rooms[room_id] == 'undefined'){
            return;
        }
        client_rooms[room_id].delete_projectile(socket.id);
        
    }); 

    // disconnect
    socket.on('disconnect', () => {
        room_id = ids_to_rooms[socket.id];
        if (typeof client_rooms[room_id] != 'undefined'){
            client_rooms[room_id].delete_player(socket.id);
            // send new info to anyone except themselves
            for(var key in client_rooms[room_id].players){
                if(socket.id != key){
                    io.to(key).emit('receive_players', client_rooms[room_id].get_players_except(key));
                }
            }
            if(Object.keys(client_rooms[room_id].players).length <= 0){
                delete client_rooms[room_id];
            }
        }
        delete ids_to_rooms[socket.id];
    });
});

server.listen(process.env.port || 3000, () => {
    console.log('Server is running!');
});
