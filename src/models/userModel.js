import pool from '../config/db.js';

const getAllUsersService = async () => {
    const result = await pool.query('SELECT uid, username, uname, pos, "desc", created_at FROM users ORDER BY uid');
    return result.rows;
};

const getUserByIdService = async (id) => {
    const result = await pool.query(
        'SELECT uid, username, uname, pos, "desc", created_at FROM users WHERE uid = $1',
        [id]
    );
    return result.rows[0];
};

const getUserByUsernameService = async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

const createUserService = async ({ username, password, uname, pos, desc }) => {
    const result = await pool.query(
        `INSERT INTO users (username, password, uname, pos, "desc")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING uid, username, uname, pos, "desc", created_at`,
        [username, password, uname, pos, desc]
    );
    return result.rows[0];
};

const updateUserService = async (id, { username, password, uname, pos, desc }) => {
    const result = await pool.query(
        `UPDATE users
         SET username = $1,
             password = $2,
             uname = $3,
             pos = $4,
             "desc" = $5
         WHERE uid = $6
         RETURNING uid, username, uname, pos, "desc", created_at`,
        [username, password, uname, pos, desc, id]
    );
    return result.rows[0];
};

const patchUserService = async (id, fields) => {
    const allowedFields = ['username', 'password', 'uname', 'pos', 'desc'];
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
        `UPDATE users
         SET ${setClauses.join(', ')}
         WHERE uid = $${values.length}
         RETURNING uid, username, uname, pos, "desc", created_at`,
        values
    );
    return result.rows[0];
};

const deleteUserService = async (id) => {
    const result = await pool.query(
        'DELETE FROM users WHERE uid = $1 RETURNING uid, username, uname, pos, "desc", created_at',
        [id]
    );
    return result.rows[0];
};

export default {
    getAllUsersService,
    getUserByIdService,
    getUserByUsernameService,
    createUserService,
    updateUserService,
    patchUserService,
    deleteUserService
};
