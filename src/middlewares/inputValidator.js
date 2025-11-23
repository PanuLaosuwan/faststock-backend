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
    day: joi.number().integer().min(1),
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

const barSchema = joi.object({
    eid: joi.number().integer().positive().required(),
    uid: joi.number().integer().positive().required(),
    bname: joi.string().min(1).max(255).required(),
    desc: joi.string().allow(null, '')
});

const barPatchSchema = joi.object({
    eid: joi.number().integer().positive(),
    uid: joi.number().integer().positive(),
    bname: joi.string().min(1).max(255),
    desc: joi.string().allow(null, '')
}).min(1);

const stockInitialSchema = joi.object({
    pid: joi.number().integer().positive().required(),
    sdate: joi.date().iso().required(),
    start_quantity: joi.number().integer().required(),
    start_subquantity: joi.number().min(0).default(0),
    end_quantity: joi.number().integer(),
    end_subquantity: joi.number().min(0),
    desc: joi.string().allow(null, '')
});

const stockPatchSchema = joi.object({
    start_quantity: joi.number().integer(),
    start_subquantity: joi.number().min(0),
    end_quantity: joi.number().integer(),
    end_subquantity: joi.number().min(0),
    desc: joi.string().allow(null, '')
}).min(1);

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

export const validateBar = (req, res, next) => {
    const { error } = barSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateBarPatch = (req, res, next) => {
    const { error } = barPatchSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    next();
};

export const validateStockInitial = (req, res, next) => {
    const { error, value } = stockInitialSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    req.body = value;
    next();
};

export const validateStockPatch = (req, res, next) => {
    const { error, value } = stockPatchSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message
        });
    }
    req.body = value;
    next();
};

export default validateUser;
