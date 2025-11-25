import pool from '../config/db.js';

const baseSelect = `
    SELECT
        b.bid,
        b.bcode,
        b.eid,
        b.uid,
        b."desc",
        e.location,
        e.ename
    FROM bar b
    JOIN event e ON b.eid = e.eid
`;

const getAllBarsService = async () => {
    const result = await pool.query(
        `${baseSelect} ORDER BY b.bcode`
    );
    return result.rows;
};

const getBarsByUserService = async (uid) => {
    const result = await pool.query(
        `${baseSelect} WHERE b.uid = $1 ORDER BY b.bcode`,
        [uid]
    );
    return result.rows;
};

const getBarsByEventService = async (eid) => {
    const result = await pool.query(
        `${baseSelect} WHERE b.eid = $1 ORDER BY b.bcode`,
        [eid]
    );
    return result.rows;
};

const getBarByIdService = async (bid) => {
    const result = await pool.query(
        `${baseSelect} WHERE b.bid = $1`,
        [bid]
    );
    return result.rows[0];
};

const createBarService = async ({ bcode, eid, uid, desc }) => {
    const result = await pool.query(
        `INSERT INTO bar (bcode, eid, uid, "desc")
         VALUES ($1, $2, $3, $4)
         RETURNING bid, bcode, eid, uid, "desc"`,
        [bcode, eid, uid, desc]
    );
    return result.rows[0];
};

const updateBarService = async (bid, { bcode, eid, uid, desc }) => {
    const result = await pool.query(
        `UPDATE bar
         SET bcode = $1,
             eid = $2,
             uid = $3,
             "desc" = $4
         WHERE bid = $5
         RETURNING bid, bcode, eid, uid, "desc"`,
        [bcode, eid, uid, desc, bid]
    );
    return result.rows[0];
};

const patchBarService = async (bid, fields) => {
    const allowedFields = ['bcode', 'eid', 'uid', 'desc'];
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

    values.push(bid);

    const result = await pool.query(
        `UPDATE bar
         SET ${setClauses.join(', ')}
         WHERE bid = $${values.length}
         RETURNING bid, bcode, eid, uid, "desc"`,
        values
    );
    return result.rows[0];
};

const deleteBarService = async (bid) => {
    const result = await pool.query(
        'DELETE FROM bar WHERE bid = $1 RETURNING bid, bcode, eid, uid, "desc"',
        [bid]
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
