import pool from '../config/db.js';

const getStockByBarService = async (bid, sdate = null) => {
    const values = [bid];
    let where = 'WHERE s.bid = $1';

    if (sdate) {
        values.push(sdate);
        where += ` AND s.sdate = $${values.length}`;
    }

    const result = await pool.query(
        `SELECT
      
            b.eid,
            e.ename,
            b.bid,
            b.bname,
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
    
      
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bid
        JOIN event e ON b.eid = e.eid
        ${where}
        ORDER BY s.sdate DESC, s.pid`,
        values
    );
    return result.rows;
};

const getAllStockService = async () => {
    const result = await pool.query(
        `SELECT
            b.eid,
            e.ename,
            s.bid,
            b.bname,
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
     
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bid
        JOIN event e ON b.eid = e.eid
        ORDER BY s.sdate DESC, s.bid, s.pid`
    );
    return result.rows;
};

const getStockByEventService = async (eid) => {
    const result = await pool.query(
        `SELECT
            b.eid,
            e.ename,
            s.bid,
            b.bname,
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
     
        FROM stock s
        JOIN product p ON s.pid = p.pid
        JOIN bar b ON s.bid = b.bid
        JOIN event e ON b.eid = e.eid
        WHERE b.eid = $1
        ORDER BY s.sdate DESC, s.bid, s.pid`,
        [eid]
    );
    return result.rows;
};

const createStockInitialService = async ({
    bid,
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
            bid, sdate, pid,
            start_quantity, start_subquantity,
            end_quantity, end_subquantity,
            "desc"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING bid, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        [bid, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, desc]
    );
    return result.rows[0];
};

const patchStockService = async (bid, pid, sdate, fields) => {
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

    values.push(bid, sdate, pid);

    const result = await pool.query(
        `UPDATE stock
         SET ${setClauses.join(', ')}
         WHERE bid = $${values.length - 2}
           AND sdate = $${values.length - 1}
           AND pid = $${values.length}
         RETURNING bid, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        values
    );
    return result.rows[0];
};

const deleteStockService = async (bid, pid, sdate) => {
    const result = await pool.query(
        `DELETE FROM stock
         WHERE bid = $1 AND pid = $2 AND sdate = $3
         RETURNING bid, sdate, pid, start_quantity, start_subquantity, end_quantity, end_subquantity, "desc"`,
        [bid, pid, sdate]
    );
    return result.rows[0];
};

export default {
    getStockByBarService,
    getAllStockService,
    getStockByEventService,
    createStockInitialService,
    patchStockService,
    deleteStockService
};
