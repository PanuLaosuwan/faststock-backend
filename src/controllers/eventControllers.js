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

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await getAllEventsService();
        handleResponse(res, 200, 'Events fetched successfully', events);
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
        handleResponse(res, 200, 'Event fetched successfully', event);
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const { ename, edate_start, edate_end, day, desc } = req.body;
        const event = await createEventService({
            ename,
            edate_start,
            edate_end,
            day,
            desc: desc || null
        });
        handleResponse(res, 201, 'Event created successfully', event);
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ename, edate_start, edate_end, day, desc } = req.body;
        const event = await updateEventService(id, {
            ename,
            edate_start,
            edate_end,
            day,
            desc: desc || null
        });
        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }
        handleResponse(res, 200, 'Event updated successfully', event);
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

        const event = await patchEventService(id, updates);

        if (!event) {
            return handleResponse(res, 404, 'Event not found', null);
        }

        handleResponse(res, 200, 'Event updated successfully', event);
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
        handleResponse(res, 200, 'Event deleted successfully', event);
    } catch (error) {
        next(error);
    }
};
