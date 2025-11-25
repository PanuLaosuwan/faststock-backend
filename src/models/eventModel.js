import pool from '../config/db.js';

const getAllEventsService = async () => {
    const result = await pool.query(
        'SELECT eid, ename, edate_start, edate_end, day, location, "desc" FROM event ORDER BY eid'
    );
    return result.rows;
};

const getEventByIdService = async (id) => {
    const result = await pool.query(
        'SELECT eid, ename, edate_start, edate_end, day, location, "desc" FROM event WHERE eid = $1',
        [id]
    );
    return result.rows[0];
};

const createEventService = async ({ ename, edate_start, edate_end, day, location, desc }) => {
    const result = await pool.query(
        `INSERT INTO event (ename, edate_start, edate_end, day, location, "desc")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING eid, ename, edate_start, edate_end, day, location, "desc"`,
        [ename, edate_start, edate_end, day, location, desc]
    );
    return result.rows[0];
};

const updateEventService = async (id, { ename, edate_start, edate_end, day, location, desc }) => {
    const result = await pool.query(
        `UPDATE event
         SET ename = $1,
             edate_start = $2,
             edate_end = $3,
             day = $4,
             location = $5,
             "desc" = $6
         WHERE eid = $7
         RETURNING eid, ename, edate_start, edate_end, day, location, "desc"`,
        [ename, edate_start, edate_end, day, location, desc, id]
    );
    return result.rows[0];
};

const patchEventService = async (id, fields) => {
    const allowedFields = ['ename', 'edate_start', 'edate_end', 'day', 'location', 'desc'];
    const setClauses = [];
    const values = [];

    allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(fields, field)) {
            const column = field === 'desc' ? '"desc"' : field;
            values.push(fields[field]);
            setClauses.push(`${column} = $${values.length}`);
        }
    });

    if (setClauses.length === 0) {
        return null;
    }

    values.push(id);

    const result = await pool.query(
        `UPDATE event
         SET ${setClauses.join(', ')}
         WHERE eid = $${values.length}
         RETURNING eid, ename, edate_start, edate_end, day, location, "desc"`,
        values
    );
    return result.rows[0];
};

const deleteEventService = async (id) => {
    const result = await pool.query(
        'DELETE FROM event WHERE eid = $1 RETURNING eid, ename, edate_start, edate_end, day, "desc"',
        [id]
    );
    return result.rows[0];
};

export default {
    getAllEventsService,
    getEventByIdService,
    createEventService,
    updateEventService,
    patchEventService,
    deleteEventService
};
