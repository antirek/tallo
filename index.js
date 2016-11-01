var express = require('express');
var basicAuth = require('basic-auth');
var child_process = require('child_process');
var session = require('express-session');
var console = require('tracer').colorConsole();
var Joi = require('joi');
var bodyParser = require('body-parser');

var configSchema = require('./lib/configSchema');

class Server {
    constructor(config) {
        this._config = config;
        this._validateConfig();
        this._init();
    }

    _init() {
        var app = express();
        app.use(session({
            secret: 'abcdefghijklmnopqrstuvwxyz1234567890',
            resave: true,
            saveUninitialized: true
        }));

        app.get('/login', (req, res)=> {
            res.render('login');
        });
        app.post('/login', bodyParser.urlencoded({extended: false}), (req, res)=> {
            var user = req.body;
            console.log('user', user);
            if (user) {
                var validUser = this._config.users.find((userConfig) => {
                    return userConfig.name === user.name && userConfig.password === user.pass;
                });

                if (validUser) {
                    req.session.isAuth = true;
                    req.session.user = user;
                    res.redirect('/');
                } else {
                    res.redirect('/login')
                }
            } else {
                res.redirect('/login');
            }
        });


        app.set('views', __dirname + "/views");
        app.set('view engine', 'pug');


        app.use('/bower_components', express["static"]("./bower_components"));

        app.use((req, res, next)=> {
            if (req.session.isAuth) {
                next()
            } else {
                console.log('user not autorized');
                res.redirect('/login');
            }
        });
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
            var user = req.session.user;
            var commandConfig = req.server.commands.find((cmd) => {
                return cmd.name === command;
            });
            console.log('run command', req.params);
            console.log('commandConfig', commandConfig);
            console.log('user', user);
            if (commandConfig) {
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