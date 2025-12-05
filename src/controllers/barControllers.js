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

const parseBid = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
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
        const barId = parseBid(bid);
        if (barId === null) {
            return handleResponse(res, 400, 'Invalid bar id', null);
        }
        const bar = await getBarByIdService(barId);
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
        const barId = parseBid(bid);
        if (barId === null) {
            return handleResponse(res, 400, 'Invalid bar id', null);
        }
        const { bcode, eid, uid, desc } = req.body;
        const bar = await updateBarService(barId, {
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
        const barId = parseBid(bid);
        if (barId === null) {
            return handleResponse(res, 400, 'Invalid bar id', null);
        }
        const updates = { ...req.body };

        if (Object.keys(updates).length === 0) {
            return handleResponse(res, 400, 'No fields provided for update', null);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === undefined) {
            updates.desc = null;
        }

        const bar = await patchBarService(barId, updates);
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
        const barId = parseBid(bid);
        if (barId === null) {
            return handleResponse(res, 400, 'Invalid bar id', null);
        }
        const bar = await deleteBarService(barId);
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }
        handleResponse(res, 200, 'Bar deleted successfully', bar);
    } catch (error) {
        next(error);
    }
};
