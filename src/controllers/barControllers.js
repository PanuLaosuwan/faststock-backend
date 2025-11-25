import barServices from '../models/barModel.js';

const {
    getAllBarsService,
    getBarsByUserService,
    getBarsByEventService,
    getBarByIdService,
    createBarService,
    updateBarService,
    patchBarService,
    deleteBarService
} = barServices;

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getAllBars = async (req, res, next) => {
    try {
        const bars = await getAllBarsService();
        handleResponse(res, 200, 'Bars fetched successfully', bars);
    } catch (error) {
        next(error);
    }
};

export const getBarsByUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const bars = await getBarsByUserService(uid);
        handleResponse(res, 200, 'Bars fetched successfully', bars);
    } catch (error) {
        next(error);
    }
};

export const getBarsByEvent = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const bars = await getBarsByEventService(eid);
        handleResponse(res, 200, 'Bars fetched successfully', bars);
    } catch (error) {
        next(error);
    }
};

export const getBarById = async (req, res, next) => {
    try {
        const { bid } = req.params;
        const bar = await getBarByIdService(bid);
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }
        handleResponse(res, 200, 'Bar fetched successfully', bar);
    } catch (error) {
        next(error);
    }
};

export const createBar = async (req, res, next) => {
    try {
        const { bcode, eid, uid, desc } = req.body;
        const bar = await createBarService({
            bcode,
            eid,
            uid,
            desc: desc || null
        });
        handleResponse(res, 201, 'Bar created successfully', bar);
    } catch (error) {
        next(error);
    }
};

export const updateBar = async (req, res, next) => {
    try {
        const { bid } = req.params;
        const { bcode, eid, uid, desc } = req.body;
        const bar = await updateBarService(bid, {
            bcode,
            eid,
            uid,
            desc: desc || null
        });
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }
        handleResponse(res, 200, 'Bar updated successfully', bar);
    } catch (error) {
        next(error);
    }
};

export const patchBar = async (req, res, next) => {
    try {
        const { bid } = req.params;
        const updates = { ...req.body };

        if (Object.keys(updates).length === 0) {
            return handleResponse(res, 400, 'No fields provided for update', null);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === undefined) {
            updates.desc = null;
        }

        const bar = await patchBarService(bid, updates);
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }

        handleResponse(res, 200, 'Bar updated successfully', bar);
    } catch (error) {
        next(error);
    }
};

export const deleteBar = async (req, res, next) => {
    try {
        const { bid } = req.params;
        const bar = await deleteBarService(bid);
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }
        handleResponse(res, 200, 'Bar deleted successfully', bar);
    } catch (error) {
        next(error);
    }
};
