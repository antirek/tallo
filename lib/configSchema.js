const Joi = require('joi');

var configSchema = Joi.object().keys({
    port: Joi.number().integer().min(1).max(65535).required(),
    groups: Joi.array().min(1).items(
        Joi.object().keys({
            name: Joi.string(),
            servers: Joi.array().min(1).items(
                Joi.object().keys({
                    name: Joi.string(),
                    commands: Joi.array().min(1).items({
                        name: Joi.string().required(),
                        run: Joi.string().required()
                    })
                })
            )
        })
    ),
    users: Joi.array().min(1).items(
        Joi.object().keys({
            name: Joi.string().required(),
            password: Joi.string().required()
        })
    )
});

module.exports = configSchema;