import stockServices from '../models/stockModel.js';

const {
    getStockByBarService,
    getAllStockService,
    getStockByEventService,
    createStockInitialService,
    patchStockService
} = stockServices;

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

const formatStock = (row) => {
    if (!row) return row;
    return {
        ...row,
        sdate: toDateOnly(row.sdate)
    };
};

export const getStockForBar = async (req, res, next) => {
    try {
        const { barId } = req.params;
        const { date } = req.query;
        const rows = await getStockByBarService(barId, date || null);
        const formatted = rows.map(formatStock);
        handleResponse(res, 200, 'Stock fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getAllStock = async (req, res, next) => {
    try {
        const rows = await getAllStockService();
        const formatted = rows.map(formatStock);
        handleResponse(res, 200, 'Stock fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getStockForEvent = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const rows = await getStockByEventService(eid);
        const formatted = rows.map(formatStock);
        handleResponse(res, 200, 'Stock fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const createStockInitial = async (req, res, next) => {
    try {
        const { barId } = req.params;
        const {
            pid,
            sdate,
            start_quantity,
            start_subquantity = 0,
            end_quantity,
            end_subquantity,
            desc
        } = req.body;

        const endQty = end_quantity !== undefined ? end_quantity : start_quantity;
        const endSubQty = end_subquantity !== undefined ? end_subquantity : start_subquantity;

        try {
            const stock = await createStockInitialService({
                bid: barId,
                pid,
                sdate,
                start_quantity,
                start_subquantity,
                end_quantity: endQty,
                end_subquantity: endSubQty,
                desc: desc || null
            });
            handleResponse(res, 201, 'Stock created successfully', formatStock(stock));
        } catch (err) {
            if (err.code === '23505') {
                return handleResponse(res, 409, 'Stock already exists for this bar, date, and product', null);
            }
            if (err.code === '23503') {
                return handleResponse(res, 400, 'Invalid bar or product reference', null);
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

export const patchStockEntry = async (req, res, next) => {
    try {
        const { barId, pid, sdate } = req.params;
        const updates = { ...req.body };

        const stock = await patchStockService(barId, pid, sdate, updates);

        if (!stock) {
            return handleResponse(res, 404, 'Stock entry not found', null);
        }

        handleResponse(res, 200, 'Stock updated successfully', formatStock(stock));
    } catch (error) {
        next(error);
    }
};

export default {
    getStockForBar,
    getAllStock,
    getStockForEvent,
    createStockInitial,
    patchStockEntry
};
