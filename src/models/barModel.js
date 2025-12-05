import pool from '../config/db.js';

const runBarQueries = async (queries, values = []) => {
    let lastError = null;
    for (const query of queries) {
        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            lastError = error;
            if (error.code !== '42703') {
                throw error;
            }
        }
    }
    throw lastError;
};

const baseSelect = (bidExpr) => `
    SELECT
        ${bidExpr} AS bid,
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
    const queries = [
        `${baseSelect('b.bid')} ORDER BY b.bcode`,
        `${baseSelect('NULL::integer')} ORDER BY b.bcode`
    ];
    const rows = await runBarQueries(queries);
    return rows;
};

const getBarsByUserService = async (uid) => {
    const queries = [
        `${baseSelect('b.bid')} WHERE b.uid = $1 ORDER BY b.bcode`,
        `${baseSelect('NULL::integer')} WHERE b.uid = $1 ORDER BY b.bcode`
    ];
    const rows = await runBarQueries(queries, [uid]);
    return rows;
};

const getBarsByEventService = async (eid) => {
    const queries = [
        `${baseSelect('b.bid')} WHERE b.eid = $1 ORDER BY b.bcode`,
        `${baseSelect('NULL::integer')} WHERE b.eid = $1 ORDER BY b.bcode`
    ];
    const rows = await runBarQueries(queries, [eid]);
    return rows;
};

const getBarByIdService = async (bid) => {
    const queries = [
        `${baseSelect('b.bid')} WHERE b.bid = $1`,
        `${baseSelect('NULL::integer')} WHERE b.bcode = $1::text`
    ];
    const rows = await runBarQueries(queries, [bid]);
    return rows[0];
};

const createBarService = async ({ bcode, eid, uid, desc }) => {
    const values = [bcode, eid, uid, desc];
    try {
        const result = await pool.query(
            `INSERT INTO bar (bcode, eid, uid, "desc")
             VALUES ($1, $2, $3, $4)
             RETURNING bid, bcode, eid, uid, "desc"`,
            values
        );
        return result.rows[0];
    } catch (error) {
        if (error.code !== '42703') {
            throw error;
        }
    }

    const fallback = await pool.query(
        `INSERT INTO bar (bcode, eid, uid, "desc")
         VALUES ($1, $2, $3, $4)
         RETURNING NULL::integer AS bid, bcode, eid, uid, "desc"`,
        values
    );
    return fallback.rows[0];
};

const updateBarService = async (bid, { bcode, eid, uid, desc }) => {
    const values = [bcode, eid, uid, desc, bid];
    try {
        const result = await pool.query(
            `UPDATE bar
             SET bcode = $1,
                 eid = $2,
                 uid = $3,
                 "desc" = $4
             WHERE bid = $5
             RETURNING bid, bcode, eid, uid, "desc"`,
            values
        );
        if (result.rows[0]) {
            return result.rows[0];
        }
    } catch (error) {
        if (error.code !== '42703') {
            throw error;
        }
    }

    const fallback = await pool.query(
        `UPDATE bar
         SET bcode = $1,
             eid = $2,
             uid = $3,
             "desc" = $4
         WHERE bcode = $5
         RETURNING NULL::integer AS bid, bcode, eid, uid, "desc"`,
        values
    );
    return fallback.rows[0];
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

    try {
        const result = await pool.query(
            `UPDATE bar
             SET ${setClauses.join(', ')}
             WHERE bid = $${values.length}
             RETURNING bid, bcode, eid, uid, "desc"`,
            values
        );
        if (result.rows[0]) {
            return result.rows[0];
        }
    } catch (error) {
        if (error.code !== '42703') {
            throw error;
        }
    }

    const resultFallback = await pool.query(
        `UPDATE bar
         SET ${setClauses.join(', ')}
         WHERE bcode = $${values.length}
         RETURNING NULL::integer AS bid, bcode, eid, uid, "desc"`,
        values
    );
    return resultFallback.rows[0];
};

const deleteBarService = async (bid) => {
    try {
        const result = await pool.query(
            'DELETE FROM bar WHERE bid = $1 RETURNING bid, bcode, eid, uid, "desc"',
            [bid]
        );
        if (result.rows[0]) {
            return result.rows[0];
        }
    } catch (error) {
        if (error.code !== '42703') {
            throw error;
        }
    }

    const fallback = await pool.query(
        'DELETE FROM bar WHERE bcode = $1 RETURNING NULL::integer AS bid, bcode, eid, uid, "desc"',
        [bid]
    );
    return fallback.rows[0];
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
