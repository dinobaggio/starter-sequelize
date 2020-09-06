/* eslint-disable camelcase,no-extra-boolean-cast */
import _ from 'lodash';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import validator from 'validator';

import models from '../models';
import {
    costumeValidationResult,
    generalFormPassword,
    formCreateUser
} from '../modules/validator';
import { ATTRIBUTES_ROLE, EXCLUDE_ATTR_USER, STATUS_VERIFIED } from '../libs/constant';

const {
    User
} = models;

export async function getAllUser(req, res) {
    try {
        const {
            page,
            perPage,
            sortType,
            sortBy,
            search
        } = req.query;
        let { isAdmin, isUser } = req.query
        if (isAdmin) isAdmin = validator.tooBoolean(isAdmin);
        if (isUser) isUser = validator.tooBoolean(isUser);

        let condition = {};
        if (search) {
            condition = {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        email: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            };
        }

        const roleCondition = {};
        if (isAdmin) roleCondition.isAdmin = true;
        if (isUser) roleCondition.isUser = true;

        if (Object.keys(roleCondition).length > 0) {
            condition = {
                [Op.and]: [
                    roleCondition,
                    condition
                ]
            };
        }

        const options = {
            attributes: { exclude: EXCLUDE_ATTR_USER },
            page: page || 1, // Default 1
            paginate: perPage || 10, // Default 25
            order: [[sortBy || 'name', sortType || 'ASC']],
            where: condition,
        };

        const { docs, pages, total } = await User.paginate(options);

        return res.status(200).json({
            page: page || 1,
            pages,
            per_page: perPage || 10,
            total,
            list: docs,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function getUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return next();

        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function createUser(req, res) {
    try {

        const errors = costumeValidationResult(req);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                data: errors
            });
        }

        let user = await User.createUser(req);
        user = await User.findByPk(user.id);

        return res.status(201).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return next();

        await Promise.all([
            ...formCreateUser.map(validation => validation.run(req))
        ]);

        if (password) {
            await Promise.all([
                ...generalFormPassword.map(validation => validation.run(req))
            ]);
        }

        const errors = costumeValidationResult(req);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                data: errors
            });
        }

        const data = _.omit(req.body, ATTRIBUTES_ROLE);
        if (password) data.password = bcrypt.hashSync(password, 8);

        await user.update(data);

        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return next();

        await user.destroy();

        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function validateUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return next();

        const data = { status: STATUS_VERIFIED.VERIFIED };
        await user.update(data);
        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function blockUser(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return next();

        const data = { status: STATUS_VERIFIED.BLOCKED };
        await user.update(data);

        await user.destroy();

        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export default {};