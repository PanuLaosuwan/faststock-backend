import joi from 'joi';

const userSchema = joi.object({
    username: joi.string().alphanum().min(3).max(50).required(),
    password: joi.string().min(8).max(100).required(),
    uname: joi.string().min(3).max(100).required(),
    pos: joi.string().min(2).max(50).allow(null, ''),
    desc: joi.string().max(1000).allow(null, '')
});

const userPatchSchema = joi.object({
    username: joi.string().alphanum().min(3).max(50),
    password: joi.string().min(8).max(100),
    uname: joi.string().min(3).max(100),
    pos: joi.string().min(2).max(50).allow(null, ''),
    desc: joi.string().max(1000).allow(null, '')
}).min(1);

const loginSchema = joi.object({
    username: joi.string().alphanum().min(3).max(50).required(),
    password: joi.string().min(8).max(100).required()
});

const eventSchema = joi.object({
    ename: joi.string().min(1).max(255).required(),
    edate_start: joi.date().iso().required(),
    edate_end: joi.date().iso().min(joi.ref('edate_start')).required(),
    day: joi.number().integer().min(1).required(),
    desc: joi.string().allow(null, '')
});

const eventPatchSchema = joi.object({
    ename: joi.string().min(1).max(255),
    edate_start: joi.date().iso(),
    edate_end: joi.date().iso(),
    day: joi.number().integer().min(1),
    desc: joi.string().allow(null, '')
})
    .min(1)
    .custom((value, helpers) => {
        const { edate_start, edate_end } = value;
        if (edate_start && edate_end && new Date(edate_end) < new Date(edate_start)) {
            return helpers.error('any.invalid', { message: 'edate_end must be greater than or equal to edate_start' });
        }
        return value;
    })
    .messages({
        'any.invalid': '{{#message}}'
    });

export const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateUserPatch = (req, res, next) => {
    const { error } = userPatchSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateEvent = (req, res, next) => {
    const { error } = eventSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateEventPatch = (req, res, next) => {
    const { error } = eventPatchSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export default validateUser;
