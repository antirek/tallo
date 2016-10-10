Joi = require('joi');

var configSchema = Joi.object().keys({
    port: Joi.number().integer().min(1).max(65535).required(),
    servers: Joi.array().items(
        Joi.object().keys({
            name: Joi.string(),
            commands: Joi.array().items({
                name: Joi.string().required(),
                run: Joi.string().required()
            })
        })
    ),
    users: Joi.array().items(
        Joi.object().keys({
            name: Joi.string().required(),
            password: Joi.string().required()
        })
    )
});

module.exports = configSchema;