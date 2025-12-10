import pool from '../config/db.js';

const runLostQueries = async (queries, values = []) => {
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
        e.ename,
        l.pid,
        p.pname,
        p.vol,
        p.volunit,
        p.unit,
        p.subunit,
        l.sdate,
        l.category,
        l.receiver,
        l.quantity,
        l.subquantity,
        l."desc"
`;

const getLostByBarService = async (bid, sdate = null) => {
    const values = [bid];
    let wherePrimary = 'WHERE l.bid = $1';
    let whereFallback = 'WHERE b.bid = $1';

    if (sdate) {
        values.push(sdate);
        const clause = ` AND l.sdate = $${values.length}`;
        wherePrimary += clause;
        whereFallback += clause;
    }

    const queries = [
        `
        ${baseSelect('l.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bid = b.bid
        JOIN event e ON b.eid = e.eid
        ${wherePrimary}
        ORDER BY l.sdate DESC, l.pid
    `,
        `
        ${baseSelect('b.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ${whereFallback}
        ORDER BY l.sdate DESC, l.pid
    `
    ];

    return runLostQueries(queries, values);
};

const getAllLostService = async () => {
    const queries = [
        `
        ${baseSelect('l.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bid = b.bid
        JOIN event e ON b.eid = e.eid
        ORDER BY l.sdate DESC, b.bcode, l.pid
    `,
        `
        ${baseSelect('b.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ORDER BY l.sdate DESC, b.bcode, l.pid
    `
    ];

    return runLostQueries(queries);
};

const getLostByEventService = async (eid) => {
    const queries = [
        `
        ${baseSelect('l.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bid = b.bid
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY l.sdate DESC, b.bcode, l.pid
    `,
        `
        ${baseSelect('b.bid')}
        FROM lost l
        JOIN product p ON l.pid = p.pid
        JOIN bar b ON l.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY l.sdate DESC, b.bcode, l.pid
    `
    ];

    return runLostQueries(queries, [eid]);
};

const createLostEntryService = async ({
    bid,
    pid,
    sdate,
    category,
    receiver,
    quantity,
    subquantity,
    desc
}) => {
    const result = await pool.query(
        `
        WITH ins AS (
            INSERT INTO lost (
                bid, sdate, pid,
                category, receiver,
                quantity, subquantity,
                "desc"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING bid, sdate, pid, category, receiver, quantity, subquantity, "desc"
        )
        SELECT
            ins.*,
            b.bcode,
            b.eid,
            e.ename,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit
        FROM ins
        JOIN bar b ON ins.bid = b.bid
        JOIN event e ON b.eid = e.eid
        JOIN product p ON ins.pid = p.pid
        `,
        [bid, sdate, pid, category, receiver, quantity, subquantity, desc]
    );
    return result.rows[0];
};

const patchLostService = async (bid, pid, sdate, fields) => {
    const allowedFields = ['category', 'receiver', 'quantity', 'subquantity', 'desc'];
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

    values.push(bid, sdate, pid);

    const result = await pool.query(
        `
        WITH upd AS (
            UPDATE lost
            SET ${setClauses.join(', ')}
            WHERE bid = $${values.length - 2}
              AND sdate = $${values.length - 1}
              AND pid = $${values.length}
            RETURNING bid, sdate, pid, category, receiver, quantity, subquantity, "desc"
        )
        SELECT
            upd.*,
            b.bcode,
            b.eid,
            e.ename,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit
        FROM upd
        JOIN bar b ON upd.bid = b.bid
        JOIN event e ON b.eid = e.eid
        JOIN product p ON upd.pid = p.pid
        `,
        values
    );
    return result.rows[0];
};

const deleteLostService = async (bid, pid, sdate) => {
    const result = await pool.query(
        `
        WITH del AS (
            DELETE FROM lost
            WHERE bid = $1 AND pid = $2 AND sdate = $3
            RETURNING bid, sdate, pid, category, receiver, quantity, subquantity, "desc"
        )
        SELECT
            del.*,
            b.bcode,
            b.eid,
            e.ename,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit
        FROM del
        JOIN bar b ON del.bid = b.bid
        JOIN event e ON b.eid = e.eid
        JOIN product p ON del.pid = p.pid
        `,
        [bid, pid, sdate]
    );
    return result.rows[0];
};

export default {
    getLostByBarService,
    getAllLostService,
    getLostByEventService,
    createLostEntryService,
    patchLostService,
    deleteLostService
};
