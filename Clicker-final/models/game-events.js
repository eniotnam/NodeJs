'use strict';

const EventEmitter = require('events');
class GameEmitter extends EventEmitter {}
module.exports = new GameEmitter();

module.exports.userRegistered = function(pseudo) {
    module.exports.emit('userregistered', pseudo);
};

module.exports.userConnected = function(pseudo) {
    module.exports.emit('userconnected', pseudo);
};

module.exports.userDisconnected = function() {
    module.exports.emit('userdisconnected');
}