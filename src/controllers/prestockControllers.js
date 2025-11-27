import prestockServices from '../models/prestockModel.js';

const {
    getAllPrestockService,
    getPrestockByEventService,
    createPrestockService,
    patchPrestockService,
    deletePrestockService
} = prestockServices;

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

const toDateOnly = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return d.toISOString().slice(0, 10);
};

const formatPrestock = (row) => {
    if (!row) return row;
    return {
        ...row,
        psdate: row.psdate ? toDateOnly(row.psdate) : null
    };
};

export const getAllPrestock = async (req, res, next) => {
    try {
        const rows = await getAllPrestockService();
        const formatted = rows.map(formatPrestock);
        handleResponse(res, 200, 'Prestock fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getPrestockForEvent = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const rows = await getPrestockByEventService(eid);
        const formatted = rows.map(formatPrestock);
        handleResponse(res, 200, 'Prestock fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const createPrestock = async (req, res, next) => {
    try {
        const {
            eid,
            pid,
            order_quantity = null,
            order_subquantity = null,
            real_quantity = null,
            real_subquantity = null,
            psdate = null,
            desc = null
        } = req.body;

        try {
            const prestock = await createPrestockService({
                eid,
                pid,
                order_quantity,
                order_subquantity,
                real_quantity,
                real_subquantity,
                psdate,
                desc
            });
            handleResponse(res, 201, 'Prestock created successfully', formatPrestock(prestock));
        } catch (err) {
            if (err.code === '23505') {
                return handleResponse(res, 409, 'Prestock already exists for this event and product', null);
            }
            if (err.code === '23503') {
                return handleResponse(res, 400, 'Invalid event or product reference', null);
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

export const patchPrestockEntry = async (req, res, next) => {
    try {
        const { eid, pid } = req.params;
        const updates = { ...req.body };

        const prestock = await patchPrestockService(eid, pid, updates);

        if (!prestock) {
            return handleResponse(res, 404, 'Prestock entry not found', null);
        }

        handleResponse(res, 200, 'Prestock updated successfully', formatPrestock(prestock));
    } catch (error) {
        next(error);
    }
};

export const deletePrestockEntry = async (req, res, next) => {
    try {
        const { eid, pid } = req.params;
        const prestock = await deletePrestockService(eid, pid);

        if (!prestock) {
            return handleResponse(res, 404, 'Prestock entry not found', null);
        }

        handleResponse(res, 200, 'Prestock deleted successfully', formatPrestock(prestock));
    } catch (error) {
        next(error);
    }
};

export default {
    getAllPrestock,
    getPrestockForEvent,
    createPrestock,
    patchPrestockEntry,
    deletePrestockEntry
};
