/* eslint-disable camelcase,no-extra-boolean-cast */
import _ from 'lodash';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

import models from '../models';
import {
    costumeValidationResult,
    generalFormPassword,
    formCreateUser
} from '../modules/validator';
import { STATUS_VERIFIED } from '../libs/constant';

const {
    Role
} = models;

export async function getAllRole(req, res) {
    try {
        const {
            page,
            perPage,
            sortType,
            sortBy,
            search,
        } = req.query;

        let condition = {};
        if (search) {
            condition = {
                title: {
                    [Op.like]: `%${search}%`
                }
            };
        }

        const options = {
            page: page || 1, // Default 1
            paginate: perPage || 10, // Default 25
            order: [[sortBy || 'title', sortType || 'ASC']],
            where: condition,
        };

        const { docs, pages, total } = await Role.paginate(options);

        return res.status(200).json({
            page: page || 1,
            pages,
            perPage: perPage || 10,
            total,
            list: docs,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function getRole(req, res, next) {
    try {
        const { id } = req.params;
        const user = await Role.findByPk(id);
        if (!user) return next();

        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export default {};