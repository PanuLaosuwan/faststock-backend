import pool from '../config/db.js';

const runStockQueries = async (queries, values) => {
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

const getStockByBarService = async (bcode, sdate = null) => {
    const values = [bcode];
    let wherePrimary = 'WHERE s.bcode = $1';
    let whereFallback = 'WHERE b.bcode = $1';

    if (sdate) {
        values.push(sdate);
        const dateClause = ` AND s.sdate = $${values.length}`;
        wherePrimary += dateClause;
        whereFallback += dateClause;
    }

    const baseSelect = (bidExpr) => `
        SELECT
            ${bidExpr} AS bid,
            b.eid,
            e.ename,
            b.bcode,
            s.pid,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit,
            s.sdate,
            s.start_quantity,
            s.start_subquantity,
            s.end_quantity,
            s.end_subquantity,
            s."desc"
    `;

    const queries = [
        `
        ${baseSelect('b.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ${wherePrimary}
        ORDER BY s.sdate DESC, s.pid
    `,
        `
        ${baseSelect('NULL::integer')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ${wherePrimary}
        ORDER BY s.sdate DESC, s.pid
    `,
        `
        ${baseSelect('s.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bcode
        JOIN event e ON b.eid = e.eid
        ${whereFallback}
        ORDER BY s.sdate DESC, s.pid
    `
    ];

    return runStockQueries(queries, values);
};

const getAllStockService = async () => {
    const baseSelect = (bidExpr) => `
        SELECT
            ${bidExpr} AS bid,
            b.eid,
            e.ename,
            b.bcode,
            s.pid,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit,       
            s.sdate,
            s.start_quantity,
            s.start_subquantity,
            s.end_quantity,
            s.end_subquantity,
            s."desc"
    `;

    const queries = [
        `
        ${baseSelect('b.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `,
        `
        ${baseSelect('NULL::integer')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `,
        `
        ${baseSelect('s.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bcode
        JOIN event e ON b.eid = e.eid
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `
    ];

    return runStockQueries(queries, []);
};

const getStockByEventService = async (eid) => {
    const baseSelect = (bidExpr) => `
        SELECT
            ${bidExpr} AS bid,
            b.eid,
            e.ename,
            b.bcode,
            s.pid,
            p.pname,
            p.vol,
            p.volunit,
            p.unit,
            p.subunit,
            s.sdate,
            s.start_quantity,
            s.start_subquantity,
            s.end_quantity,
            s.end_subquantity,
            s."desc"
    `;

    const queries = [
        `
        ${baseSelect('b.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `,
        `
        ${baseSelect('NULL::integer')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bcode = b.bcode
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `,
        `
        ${baseSelect('s.bid')}
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bcode
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY s.sdate DESC, b.bcode, s.pid
    `
    ];

    return runStockQueries(queries, [eid]);
};

const createStockInitialService = async ({
    bcode,
    pid,
    sdate,
    start_quantity,
    start_subquantity,
    end_quantity,
    end_subquantity,
    desc
}) => {
    const result = await pool.query(
        `INSERT INTO stock (
            bcode, sdate, pid,
            start_quantity, start_subquantity,
            end_quantity, end_subquantity,
            "desc"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        [bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, desc]
    );
    return result.rows[0];
};

const patchStockService = async (bcode, pid, sdate, fields) => {
    const allowedFields = [
        'start_quantity',
        'start_subquantity',
        'end_quantity',
        'end_subquantity',
        'desc'
    ];
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

    values.push(bcode, sdate, pid);

    const result = await pool.query(
        `UPDATE stock
         SET ${setClauses.join(', ')}
         WHERE bcode = $${values.length - 2}
           AND sdate = $${values.length - 1}
           AND pid = $${values.length}
         RETURNING bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        values
    );
    return result.rows[0];
};

const deleteStockService = async (bcode, pid, sdate) => {
    const result = await pool.query(
        `DELETE FROM stock
         WHERE bcode = $1 AND pid = $2 AND sdate = $3
         RETURNING bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        [bcode, pid, sdate]
    );
    return result.rows[0];
};

const upsertStockBulkService = async (bcode, items) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const results = [];

        for (const item of items) {
            const {
                pid,
                sdate,
                start_quantity,
                start_subquantity,
                end_quantity,
                end_subquantity,
                desc
            } = item;

            const result = await client.query(
                `INSERT INTO stock (
                    bcode, sdate, pid,
                    start_quantity, start_subquantity,
                    end_quantity, end_subquantity,
                    "desc"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (bcode, sdate, pid) DO UPDATE SET
                    start_quantity = EXCLUDED.start_quantity,
                    start_subquantity = EXCLUDED.start_subquantity,
                    end_quantity = EXCLUDED.end_quantity,
                    end_subquantity = EXCLUDED.end_subquantity,
                    "desc" = EXCLUDED."desc"
                RETURNING bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc", xmax = 0 AS created`,
                [bcode, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, desc]
            );

            results.push(result.rows[0]);
        }

        await client.query('COMMIT');
        return results;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default {
    getStockByBarService,
    getAllStockService,
    getStockByEventService,
    createStockInitialService,
    patchStockService,
    deleteStockService,
    upsertStockBulkService
};
