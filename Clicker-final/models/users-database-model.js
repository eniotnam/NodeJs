'use strict';

const util = require('util');
const fs = require('fs-extra');
const jsyaml = require('js-yaml');
const Sequelize = require("sequelize");
const log = require('debug')('clicker:database-model');

var userSchema;
var database;

exports.connect = function() {
    
    if(userSchema) return userSchema.sync();
    
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
        
        if(!userSchema){
            userSchema = database.define('User', {
            pseudo: { type: Sequelize.STRING, primaryKey: true, unique: true },
            password: Sequelize.STRING
            });
        }
        return userSchema.sync();
    });
};

exports.create = function(pseudo, password)  {
    return exports.connect()
    .then(schema => {
        return schema.create({
            pseudo: pseudo,
            password: password
        });
    });
};

exports.update = function(pseudo, password) {
    return exports.connect()
    .then(schema => {
        return schema.find( { where: { pseudo: pseudo } })
        .then(user => {
            return user? user.updateAttributes({ password: password }) : undefined;
        });
    });
};

exports.destroy = function(pseudo) {
    return exports.connect()
    .then(schema => {
        return schema.find({ where: { pseudo: pseudo }})
        .then(user => {
            return user.destroy();
        });
    });
};

exports.find = function(pseudo) {
    log('find ' + pseudo);
    return exports.connect()
    .then(schema => {
        return schema.find({ where: { pseudo: pseudo } });
    })
    .then(user => user? exports.formated(user) : undefined);
};

exports.register = function(pseudo, password) {
    return exports.find(pseudo)
    .then(user => {
        if(user) return undefined;
        return exports.create(pseudo, password);
    });
};

exports.passwordCheck = function(pseudo, password) {
    return exports.connect()
    .then(schema => {
        return schema.find({ where: { pseudo: pseudo } });
    })
    .then(user => {
        if(!user) {
            return { check: false, pseudo: pseudo, message: "Could not find user" };
        }
        else if (user.pseudo === pseudo && user.password === password) {
            return { check: true, pseudo: pseudo };
        }
        else {
            return { check: false, pseudo: pseudo, message: "Incorrect password" };
        }
    });
};

exports.allUsers = function() {
    return exports.connect()
    .then(schema => schema.findAll({}))
    .then(list => list.map(user => exports.formated(user)))
    .catch(err => console.error(err));
}

exports.formated = function(user) {
    return {
        pseudo: user.pseudo,
        password: user.password
    };
};