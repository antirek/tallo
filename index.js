var express = require('express');
var basicAuth = require('basic-auth');
var child_process = require('child_process');
var console = require('tracer').colorConsole();
var Joi = require('joi');
var configSchema = require('./lib/configSchema');

class Server {
    constructor(config) {
        this._config = config;
        this._validateConfig();
        this._init();
    }

    _init() {
        var app = express();
        app.use((req, res, next) => {
            var user = basicAuth(req);
            if (user) {
                var validUser = this._config.users.find((userConfig) => {
                    return userConfig.name === user.name && userConfig.password === user.pass;
                });

                if (validUser) {
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
                groups: this._config.groups
            });
        });

        app.use('/server/:group/:name', (req, res, next) => {
            var name = req.params.name;
            var group = this._config.groups.find((g)=> {
                return g.name === req.params.group;
            });

            if (group) {
                var server = group.servers.find((server) => {
                    return server.name === name;
                });

                if (server) {
                    req.group = group;
                    req.server = server;
                    next();
                } else {
                    next("server not exits");
                }
            } else {
                next("group not exists");
            }
        });

        app.get('/server/:group/:name', (req, res) => {
            res.render('server', {
                server: req.server,
                group: req.group
            })
        });

        app.get('/server/:group/:name/run/:command', (req, res) => {
            var command = req.params.command;
            var commandConfig = req.server.commands.find((cmd) => {
                return cmd.name === command;
            });

            if (commandConfig) {
                var user = basicAuth(req);

                console.log(user.name, 'try exec command', command, 'on server', req.server.name);
                console.log('command', commandConfig.run);

                child_process.exec(commandConfig.run, (err, stdout, stderr) => {
                    if (err) {
                        res.json({
                            status: 'not ok',
                            error: stderr.toString()
                        });
                    } else {
                        res.json({
                            status: "ok",
                            result: stdout.toString()
                        });
                    }
                });
            } else {
                res.json({
                    status: 'not ok',
                    error: 'not command'
                });
            }
        });
        this._app = app;
    }

    _validateConfig() {
        Joi.validate(this._config, configSchema, {allowUnknown: true}, (err, config) => {
            console.log(err);
            if (err) {
                process.exit(1);
            }
        });
    }

    run() {
        this._app.listen(this._config.port, () => {
            console.log('server started on', this._config.port);
        });
    }
}

module.exports = Server;