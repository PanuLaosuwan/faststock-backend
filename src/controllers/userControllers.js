import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userServices from '../models/userModel.js';

const {
    getAllUsersService,
    getUserByIdService,
    getUserByUsernameService,
    createUserService,
    updateUserService,
    patchUserService,
    deleteUserService
} = userServices;

const sanitizeUser = (user) => {
    if (!user) {
        return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
};

const handleResponse = (res, status, message, data = null) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        const safeUsers = users.map(sanitizeUser);
        handleResponse(res, 200, 'Users fetched successfully', safeUsers);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { username, password, uname, pos, desc } = req.body;
        const existingUser = await getUserByUsernameService(username);
        if (existingUser) {
            return handleResponse(res, 409, 'Username already in use', null);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUserService({
            username,
            password: hashedPassword,
            uname,
            pos: pos || null,
            desc: desc || null
        });
        handleResponse(res, 201, 'User created successfully', sanitizeUser(user));
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id);
        if (!user) {
            return handleResponse(res, 404, 'User not found', null);
        }
        handleResponse(res, 200, 'User fetched successfully', sanitizeUser(user));
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, password, uname, pos, desc } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await updateUserService(id, {
            username,
            password: hashedPassword,
            uname,
            pos: pos || null,
            desc: desc || null
        });
        if (!user) {
            return handleResponse(res, 404, 'User not found', null);
        }
        handleResponse(res, 200, 'User updated successfully', sanitizeUser(user));
    } catch (error) {
        next(error);
    }
};

export const patchUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (Object.keys(updates).length === 0) {
            return handleResponse(res, 400, 'No fields provided for update', null);
        }

        if (updates.username) {
            const existingUser = await getUserByUsernameService(updates.username);
            if (existingUser && existingUser.uid !== Number(id)) {
                return handleResponse(res, 409, 'Username already in use', null);
            }
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'pos') && updates.pos === '') {
            updates.pos = null;
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'desc')) {
            if (updates.desc === undefined || updates.desc === '') {
                updates.desc = null;
            }
        }

        const user = await patchUserService(id, updates);

        if (!user) {
            return handleResponse(res, 404, 'User not found', null);
        }

        handleResponse(res, 200, 'User updated successfully', sanitizeUser(user));
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await deleteUserService(id);
        if (!user) {
            return handleResponse(res, 404, 'User not found', null);
        }
        handleResponse(res, 200, 'User deleted successfully', sanitizeUser(user));
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsernameService(username);

        if (!user) {
            return handleResponse(res, 401, 'Invalid username or password', null);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return handleResponse(res, 401, 'Invalid username or password', null);
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not configured');
        }

          const token = jwt.sign(
            { uid: user.uid, username: user.username },
            jwtSecret,
            { expiresIn: '8h' }
          );
          

        handleResponse(res, 200, 'Login successful', {
            user: sanitizeUser(user),
            token
        });
        if(!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
          return handleResponse(res, 401, 'Unauthenticated', null);
        }
        handleResponse(res, 200, 'Current user fetched successfully', sanitizeUser(req.user));
      } catch (error) {
        next(error);
      }
};
