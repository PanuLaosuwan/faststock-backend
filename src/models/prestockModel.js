import pool from '../config/db.js';

const baseSelect = `
    SELECT
        ps.eid,
        e.ename,
        ps.pid,
        p.pname,
        p.vol,
        p.volunit,
        p.unit,
        p.subunit,
        ps.order_quantity,
        ps.order_subquantity,
        ps.real_quantity,
        ps.real_subquantity,
        ps.psdate,
        ps."desc"
    FROM prestock ps
    JOIN event e ON ps.eid = e.eid
    JOIN product p ON ps.pid = p.pid
`;

const getAllPrestockService = async () => {
    const result = await pool.query(`${baseSelect} ORDER BY ps.eid, ps.pid`);
    return result.rows;
};

const getPrestockByEventService = async (eid) => {
    const result = await pool.query(`${baseSelect} WHERE ps.eid = $1 ORDER BY ps.pid`, [eid]);
    return result.rows;
};

const createPrestockService = async ({
    eid,
    pid,
    order_quantity,
    order_subquantity,
    real_quantity,
    real_subquantity,
    psdate,
    desc
}) => {
    const result = await pool.query(
        `INSERT INTO prestock (
            eid,
            pid,
            order_quantity,
            order_subquantity,
            real_quantity,
            real_subquantity,
            psdate,
            "desc"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING eid, pid, order_quantity, order_subquantity, real_quantity, real_subquantity, psdate, "desc"`,
        [eid, pid, order_quantity, order_subquantity, real_quantity, real_subquantity, psdate, desc]
    );
    return result.rows[0];
};

const patchPrestockService = async (eid, pid, fields) => {
    const allowedFields = [
        'order_quantity',
        'order_subquantity',
        'real_quantity',
        'real_subquantity',
        'psdate',
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

    values.push(eid, pid);

    const result = await pool.query(
        `UPDATE prestock
         SET ${setClauses.join(', ')}
         WHERE eid = $${values.length - 1}
           AND pid = $${values.length}
         RETURNING eid, pid, order_quantity, order_subquantity, real_quantity, real_subquantity, psdate, "desc"`,
        values
    );
    return result.rows[0];
};

const deletePrestockService = async (eid, pid) => {
    const result = await pool.query(
        `DELETE FROM prestock
         WHERE eid = $1 AND pid = $2
         RETURNING eid, pid, order_quantity, order_subquantity, real_quantity, real_subquantity, psdate, "desc"`,
        [eid, pid]
    );
    return result.rows[0];
};

export default {
    getAllPrestockService,
    getPrestockByEventService,
    createPrestockService,
    patchPrestockService,
    deletePrestockService
};
