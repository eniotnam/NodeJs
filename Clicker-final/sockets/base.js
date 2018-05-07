var counter = 0;
var level = 1;
var click = 0.25;
var pseudo = null;
const gameModel = require('../models/game-database-model');
const gameEvents = require('../models/game-events');

module.exports = function(io) {
    io.on('connection', function (socket) {


        socket.emit('click_count',{ nombre:counter,niveau:level});
        

        //when user click the button
        socket.on('clicked',function(data){
            counter += data + click;//increments global click count
            socket.emit('click_count',{ nombre:counter,niveau:level });
            //send to all users new counter value
        });
        socket.on('count',function(data){
            counter -= data;
            level++;
            click += 0.25;
            
            if(pseudo) gameModel.update(pseudo, level, click, counter);
            
            socket.emit('click_count',{ nombre:counter,niveau:level});
        });
        
        
        
        
        
        gameEvents.on('userregistered', function(data) {
            pseudo = data;
            gameModel.register(data, level, click, counter);
            socket.emit('click_count',{ nombre: counter, niveau: level });
        });
        gameEvents.on('userconnected', function(data) {
            pseudo = data;
            gameModel.get(data)
            .then(game => {
                if (game)
                {
                    counter = game.counter;
                    click = game.click;
                    level = game.level;
                    socket.emit('click_count',{ nombre:counter, niveau:level });
                }
                else
                {
                    counter = 0;
                    click = 0.25;
                    level = 1;
                    gameModel.register(data, level, click, counter);
                    socket.emit('click_count',{ nombre: 0, niveau: 1 });
                }
            });
        });
        gameEvents.on('userdisconnected', function() {
            pseudo = null;
            counter = 0;
            level = 1;
            click = 0.25;
            socket.emit('click_count',{ nombre:0, niveau:1 });
        });
        socket.on('message-send', function(data){
            var message = pseudo +' : ' + data;
            io.emit('message-formated', message);
        });
    });
};
