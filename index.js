var express = require('express');
var basicAuth = require('basic-auth');
var child_process = require('child_process');
var console = require('tracer').colorConsole();
var Joi = require('joi');
var configSchema = require('./lib/configSchema');

var Server = function (config) {

    var app = express();

    var init = function (config) {
    
        app.use((req, res, next) => {
            var user = basicAuth(req);
            if (user) {
                var validUser = config.users.filter((userConfig) => {
                    return userConfig.name === user.name && userConfig.password === user.pass;
                });

                if (validUser) {
                    //console.log('valid auth user', user.name);
                    next();
                } else {
                    console.log('not valid auth user', user.name);
                    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                    return res.sendStatus(401);
                }

            } else {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.sendStatus(401);
            }
        });


        app.set('views', __dirname + "/views");
        app.set('view engine', 'pug');


        app.use('/bower_components', express["static"]("./bower_components"));

        app.get('/', (req, res)=> {            
            res.render('index', {
                servers: config.servers
            });
        });

        app.use('/server/:name', (req, res, next) => {
            var name = req.params.name;
            
            var server = config.servers.find((server) => {
                return server.name === name;
            });

            if (server) {
                req.server = server;
                next();
            } else {
                next("server not exits");
            }
        });

        app.get('/server/:name', (req, res) => {
            res.render('server', {
                server: req.server
            })
        });

        app.get('/server/:name/run/:command', (req, res) => {
            var command = req.params.command;
            var commandConfig = req.server.commands.find((cmd) => {
                return cmd.name === command;
            });
            if (commandConfig) {
                var user = basicAuth(req)
                
                console.log(user.name, 'try exec command', command);
                console.log('command', commandConfig.run);

                child_process.exec(commandConfig.run, (err) => {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else {
                res.sendStatus(500);
            }
        });

    };

    Joi.validate(config, configSchema, {allowUnknown: true}, (err, config) => {
        if (err) {
            process.exit(1);
        }
        init(config);
    });

    var run = function () {
        app.listen(config.port, () => {
            console.log('server started on', config.port);
        });
    };

    return {
        run: run
    };
};

module.exports = Server;