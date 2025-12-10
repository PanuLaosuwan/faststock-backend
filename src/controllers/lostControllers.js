import lostServices from '../models/lostModel.js';
import barServices from '../models/barModel.js';

const {
    getLostByBarService,
    getAllLostService,
    getLostByEventService,
    createLostEntryService,
    patchLostService,
    deleteLostService
} = lostServices;

const { getBarByIdService, getBarByCodeService } = barServices;

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

const formatLost = (row) => {
    if (!row) return row;
    return {
        ...row,
        sdate: toDateOnly(row.sdate)
    };
};

const resolveBar = async ({ bid, bcode }) => {
    if (bcode) {
        const bar = await getBarByCodeService(bcode);
        return bar ? { bar } : { bar: null, error: 'not_found' };
    }

    if (bid === undefined) {
        return { bar: null };
    }

    const parsedBid = Number.parseInt(bid, 10);
    if (Number.isNaN(parsedBid)) {
        return { bar: null, error: 'invalid' };
    }

    const bar = await getBarByIdService(parsedBid);
    if (!bar) {
        return { bar: null, error: 'not_found' };
    }

    return { bar };
};

export const getLostForBar = async (req, res, next) => {
    try {
        const { bid, bcode } = req.params;
        const { bar, error } = await resolveBar({ bid, bcode });
        if (!bar) {
            if (error === 'invalid') {
                return handleResponse(res, 400, 'Invalid bar id', null);
            }
            return handleResponse(res, 404, 'Bar not found', null);
        }
        const { date } = req.query;
        const rows = await getLostByBarService(bar.bid, date || null);
        const formatted = rows.map(formatLost);
        handleResponse(res, 200, 'Lost items fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getAllLost = async (req, res, next) => {
    try {
        const rows = await getAllLostService();
        const formatted = rows.map(formatLost);
        handleResponse(res, 200, 'Lost items fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getLostForEvent = async (req, res, next) => {
    try {
        const { eid } = req.params;
        const rows = await getLostByEventService(eid);
        const formatted = rows.map(formatLost);
        handleResponse(res, 200, 'Lost items fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const createLostEntry = async (req, res, next) => {
    try {
        const { bid, bcode } = req.params;
        const { bar, error } = await resolveBar({ bid, bcode });
        if (!bar) {
            if (error === 'invalid') {
                return handleResponse(res, 400, 'Invalid bar id', null);
            }
            return handleResponse(res, 404, 'Bar not found', null);
        }

        const {
            pid,
            sdate,
            category,
            receiver = null,
            quantity,
            subquantity = 0,
            desc = null
        } = req.body;

        const receiverValue = receiver === '' ? null : receiver;
        const descValue = desc === '' ? null : desc;

        try {
            const lost = await createLostEntryService({
                bid: bar.bid,
                pid,
                sdate,
                category,
                receiver: receiverValue,
                quantity,
                subquantity,
                desc: descValue
            });
            handleResponse(res, 201, 'Lost entry created successfully', formatLost({ ...lost, bcode: bar.bcode }));
        } catch (err) {
            if (err.code === '23505') {
                return handleResponse(res, 409, 'Lost entry already exists for this bar, date, and product', null);
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

export const patchLostEntry = async (req, res, next) => {
    try {
        const { bid, bcode, pid, sdate } = req.params;
        const { bar, error } = await resolveBar({ bid, bcode });
        if (!bar) {
            if (error === 'invalid') {
                return handleResponse(res, 400, 'Invalid bar id', null);
            }
            return handleResponse(res, 404, 'Bar not found', null);
        }

        const updates = { ...req.body };

        if (Object.prototype.hasOwnProperty.call(updates, 'receiver') && updates.receiver === '') {
            updates.receiver = null;
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === '') {
            updates.desc = null;
        }

        const lost = await patchLostService(bar.bid, pid, sdate, updates);

        if (!lost) {
            return handleResponse(res, 404, 'Lost entry not found', null);
        }

        handleResponse(res, 200, 'Lost entry updated successfully', formatLost({ ...lost, bcode: bar.bcode }));
    } catch (error) {
        next(error);
    }
};

export const deleteLostEntry = async (req, res, next) => {
    try {
        const { bid, bcode, pid, sdate } = req.params;
        const { bar, error } = await resolveBar({ bid, bcode });
        if (!bar) {
            if (error === 'invalid') {
                return handleResponse(res, 400, 'Invalid bar id', null);
            }
            return handleResponse(res, 404, 'Bar not found', null);
        }

        const lost = await deleteLostService(bar.bid, pid, sdate);

        if (!lost) {
            return handleResponse(res, 404, 'Lost entry not found', null);
        }

        handleResponse(res, 200, 'Lost entry deleted successfully', formatLost({ ...lost, bcode: bar.bcode }));
    } catch (error) {
        next(error);
    }
};

export default {
    getLostForBar,
    getAllLost,
    getLostForEvent,
    createLostEntry,
    patchLostEntry,
    deleteLostEntry
};
