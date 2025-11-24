import eventServices from '../models/eventModel.js';

const {
    getAllEventsService,
    getEventByIdService,
    createEventService,
    updateEventService,
    patchEventService,
    deleteEventService
} = eventServices;

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

const formatEventDates = (event) => {
    if (!event) {
        return event;
    }
    const toDateOnly = (value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            return value;
        }
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
    };
    return {
        ...event,
        edate_start: toDateOnly(event.edate_start),
        edate_end: toDateOnly(event.edate_end)
    };
};

const normalizeDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return null;
    }
    // ใช้ UTC เพื่อไม่ให้เวลาเลื่อนเพราะ timezone
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const computeDayCount = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.floor((Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()) -
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())) / msPerDay) + 1;
    return diff;
};

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await getAllEventsService();
        const formatted = events.map(formatEventDates);
        handleResponse(res, 200, 'Events fetched successfully', formatted);
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await getEventByIdService(id);
        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }
        handleResponse(res, 200, 'Event fetched successfully', formatEventDates(event));
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const { ename, edate_start, edate_end, location, desc } = req.body;
        const startDate = normalizeDate(edate_start);
        const endDate = normalizeDate(edate_end);

        if (!startDate || !endDate) {
            return handleResponse(res, 400, 'Invalid date format', null);
        }

        const day = computeDayCount(startDate, endDate);

        if (!Number.isFinite(day) || day <= 0) {
            return handleResponse(res, 400, 'Invalid date range', null);
        }

        const event = await createEventService({
            ename,
            edate_start: startDate,
            edate_end: endDate,
            day,
            location: location || null,
            desc: desc || null
        });
        handleResponse(res, 201, 'Event created successfully', formatEventDates(event));
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ename, edate_start, edate_end, location, desc } = req.body;
        const startDate = normalizeDate(edate_start);
        const endDate = normalizeDate(edate_end);

        if (!startDate || !endDate) {
            return handleResponse(res, 400, 'Invalid date format', null);
        }

        const day = computeDayCount(startDate, endDate);

        if (!Number.isFinite(day) || day <= 0) {
            return handleResponse(res, 400, 'Invalid date range', null);
        }

        const event = await updateEventService(id, {
            ename,
            edate_start: startDate,
            edate_end: endDate,
            day,
            location: location || null,
            desc: desc || null
        });
        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }
        handleResponse(res, 200, 'Event updated successfully', formatEventDates(event));
    } catch (error) {
        next(error);
    }
};

export const patchEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (Object.keys(updates).length === 0) {
            return handleResponse(res, 400, 'No fields provided for update', null);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc') && updates.desc === undefined) {
            updates.desc = null;
        }

        const hasStart = Object.prototype.hasOwnProperty.call(updates, 'edate_start');
        const hasEnd = Object.prototype.hasOwnProperty.call(updates, 'edate_end');

        if (hasStart || hasEnd) {
            if (!hasStart || !hasEnd) {
                return handleResponse(res, 400, 'Both edate_start and edate_end are required to update dates', null);
            }
            const startDate = normalizeDate(updates.edate_start);
            const endDate = normalizeDate(updates.edate_end);

            if (!startDate || !endDate) {
                return handleResponse(res, 400, 'Invalid date format', null);
            }

            const day = computeDayCount(startDate, endDate);
            if (!Number.isFinite(day) || day <= 0) {
                return handleResponse(res, 400, 'Invalid date range', null);
            }
            updates.edate_start = startDate;
            updates.edate_end = endDate;
            updates.day = day;
        } else if (Object.prototype.hasOwnProperty.call(updates, 'day')) {
            return handleResponse(res, 400, 'Please provide edate_start and edate_end to update day', null);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'location') && updates.location === undefined) {
            updates.location = null;
        }

        const event = await patchEventService(id, updates);

        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }

        handleResponse(res, 200, 'Event updated successfully', formatEventDates(event));
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await deleteEventService(id);
        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }
        handleResponse(res, 200, 'Event deleted successfully', formatEventDates(event));
    } catch (error) {
        next(error);
    }
};
