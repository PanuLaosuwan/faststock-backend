import pool from '../config/db.js';

const getAllBarsService = async () => {
    const result = await pool.query(
        'SELECT bid, eid, uid, bname, "desc" FROM bar ORDER BY bid'
    );
    return result.rows;
};

const getBarsByUserService = async (uid) => {
    const result = await pool.query(
        'SELECT bid, eid, uid, bname, "desc" FROM bar WHERE uid = $1 ORDER BY bid',
        [uid]
    );
    return result.rows;
};

const getBarsByEventService = async (eid) => {
    const result = await pool.query(
        'SELECT bid, eid, uid, bname, "desc" FROM bar WHERE eid = $1 ORDER BY bid',
        [eid]
    );
    return result.rows;
};

const getBarByIdService = async (id) => {
    const result = await pool.query(
        'SELECT bid, eid, uid, bname, "desc" FROM bar WHERE bid = $1',
        [id]
    );
    return result.rows[0];
};

const createBarService = async ({ eid, uid, bname, desc }) => {
    const result = await pool.query(
        `INSERT INTO bar (eid, uid, bname, "desc")
         VALUES ($1, $2, $3, $4)
         RETURNING bid, eid, uid, bname, "desc"`,
        [eid, uid, bname, desc]
    );
    return result.rows[0];
};

const updateBarService = async (id, { eid, uid, bname, desc }) => {
    const result = await pool.query(
        `UPDATE bar
         SET eid = $1,
             uid = $2,
             bname = $3,
             "desc" = $4
         WHERE bid = $5
         RETURNING bid, eid, uid, bname, "desc"`,
        [eid, uid, bname, desc, id]
    );
    return result.rows[0];
};

const patchBarService = async (id, fields) => {
    const allowedFields = ['eid', 'uid', 'bname', 'desc'];
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
        `UPDATE bar
         SET ${setClauses.join(', ')}
         WHERE bid = $${values.length}
         RETURNING bid, eid, uid, bname, "desc"`,
        values
    );
    return result.rows[0];
};

const deleteBarService = async (id) => {
    const result = await pool.query(
        'DELETE FROM bar WHERE bid = $1 RETURNING bid, eid, uid, bname, "desc"',
        [id]
    );
    return result.rows[0];
};
export default {
    getAllBarsService,
    getBarsByUserService,
    getBarsByEventService,
    getBarByIdService,
    createBarService,
    updateBarService,
    patchBarService,
    deleteBarService
};
