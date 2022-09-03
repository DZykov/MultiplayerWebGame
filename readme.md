# Multiplayer web shooter

This is a simple multiplayer game to play in a web browser. Multiplayer Web game is written in js. The only library used for backend is websocket.io. Frontend uses tailwind css; however, all gameplay happens in canvas. You may check this game online: webshooterio.netlify.app

## Index
   - [Demo](#Demo "Goto Demo")
   - [Game-play](#Game-play "Goto Game-play")
   - [Game Features](#Game-Features "Goto Game-Features")
   - [Controls](#Controls "Goto Controls")
   - [Structure](#Structure "Goto Structure")
   - [To-Do](#To-Do "Goto To-Do")
   - [Issues](#Issues "Goto Issues")

## Demo
https://user-images.githubusercontent.com/38252337/188250265-c2e61790-30ff-40f5-9f09-e2e140a5272d.mp4

## Gameplay

![alt text](https://github.com/DZykov/MultiplayerWebGame/blob/master/img/start_screen.png)

At the start of a session, user may choose to what room to connect; moreover, the user may choose the colour for the character, and its bullets. Then, the user is taken to the battlefiend to other players.

## Game Features

- Particles on hit
- Intuitive hp bar
- Multiplayer
- Possibility to choose/create server room
- Camera control

## Controls
| Action       | Button                            |
|--------------|-----------------------------------|
| Move Left    | <kbd>a</kbd>                      |
| Move right   | <kbd>d</kbd>                      |
| Move up      | <kbd>w</kbd>                      |
| Move down    | <kbd>s</kbd>                      |
| Fire bullets | <kbd>right mouse click</kbd>      |
| Move camera  | <kbd>middle mouse click</kbd>     |
|              |                                   |

## Structure

#### Client:
Client-side connects to the server, receives initial information about the environment, sends initial information about the player, and gets all available information about other players and projectiles. It is important to notice that, the server doesn't perform any calculations. All calculations are done on the client side.

The client-side (frontend) is run on netlify. Frontend creates polling request to the server and receives/sends all necessary data.

#### Server:
Server accepts only request from webshooterio.netlify.app. Since server doesn't perfom any calculations, it sorts data by rooms, then determines what information/data has to be send for each client.

The server is run on heroku. Server only accepts GET, POST, POLLING reqeusts from netlify.

## To-Do
- Refractor client side

## Issues
- Time delay on unstable connection
- The whole game renders and runs on client side
- Rooms don't have limit on the number of players