import barServices from '../models/barModel.js';

const {
    getAllBarsService,
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

export const getBarById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bar = await getBarByIdService(id);
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
        const { eid, uid, bname, desc } = req.body;
        const bar = await createBarService({
            eid,
            uid,
            bname,
            desc: desc || null
        });
        handleResponse(res, 201, 'Bar created successfully', bar);
    } catch (error) {
        next(error);
    }
};

export const updateBar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { eid, uid, bname, desc } = req.body;
        const bar = await updateBarService(id, {
            eid,
            uid,
            bname,
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
        const { id } = req.params;
        const updates = { ...req.body };

        if (Object.keys(updates).length === 0) {
            return handleResponse(res, 400, 'No fields provided for update', null);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === undefined) {
            updates.desc = null;
        }

        const bar = await patchBarService(id, updates);
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
        const { id } = req.params;
        const bar = await deleteBarService(id);
        if (!bar) {
            return handleResponse(res, 404, 'Bar not found', null);
        }
        handleResponse(res, 200, 'Bar deleted successfully', bar);
    } catch (error) {
        next(error);
    }
};
