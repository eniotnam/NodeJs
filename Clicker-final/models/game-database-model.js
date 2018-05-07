'use strict';

const util = require('util');
const fs = require('fs-extra');
const jsyaml = require('js-yaml');
const Sequelize = require("sequelize");
const log = require('debug')('clicker:database-model');

var gameSchema;
var database;

exports.connect = function() {
    
    if(gameSchema) return gameSchema.sync();
    
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.DATABASE_PARAMS, 'utf8', (err, data) => {
            if(err) reject(err)
            else resolve(data);
        });
    })
    .then(text => {
        return jsyaml.safeLoad(text, 'utf8');
    })
    .then(params => {
        if(!database) database = new Sequelize(params.dbname, params.username, params.password, params.params);
        
        if(!gameSchema){
            gameSchema = database.define('Game', {
            owner: { type: Sequelize.STRING, primaryKey: true, unique: true },
            level: Sequelize.INTEGER,
            click: Sequelize.FLOAT, 
            counter: Sequelize.FLOAT
            });
        }
        return gameSchema.sync();
    });
};

exports.create = function(owner, level, click, counter)  {
    return exports.connect()
    .then(schema => {
        return schema.create({
            owner: owner,
            level: level,
            click: click,
            counter: counter
        });
    });
};

exports.update = function(owner, level, click, counter) {
    return exports.connect()
    .then(schema => {
        return schema.find( { where: { owner: owner } })
        .then(game => {
            return game? game.updateAttributes({ level: level, click: click, counter: counter }) : undefined;
        });
    });
};

exports.destroy = function(owner) {
    return exports.connect()
    .then(schema => {
        return schema.find({ where: { owner: owner }})
        .then(game => {
            return gamer.destroy();
        });
    });
};

exports.get = function(owner) {
    return exports.connect()
    .then(schema => {
        return schema.find({ where: { owner: owner } });
    })
    .then(game => game? exports.formated(game) : undefined);
};

exports.register = function(owner, level, click, counter) {
    return exports.get(owner)
    .then(game => {
        if(game) return undefined;
        return exports.create(owner, level, click, counter);
    });
};

exports.count = function() {
    return exports.connect()
    .then(schema => {
        return gameSchema.count().then(count => {
            return count;
        });
    });
};

exports.highscore = function(number) {
    return exports.count()
    .then(count => {
        if(number > count) number = count;
    })
    .then(() => {
        return exports.connect()
        .then(schema => {
            return schema.findAll({
                limit: number,
                order : [
                    ['level', 'DESC'],
                    ['click', 'DESC']
                ]
            });
        })
        .then(games => {
            return games;
        });
    });
};

exports.allGames = function() {
    return exports.connect()
    .then(schema => schema.findAll({}))
    .then(list => list.map(game => exports.formated(game)))
    .catch(err => console.error(err));
}

exports.formated = function(game) {
    return {
        owner: game.owner,
        level: game.level,
        click: game.click,
        counter: game.counter
    };
};