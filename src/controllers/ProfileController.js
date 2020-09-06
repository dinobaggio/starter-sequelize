/* eslint-disable camelcase,no-extra-boolean-cast */
import _ from 'lodash';
import models from '../models';
import {
    costumeValidationResult,
    generalFormPassword
} from '../modules/validator';
import { ATTRIBUTES_ROLE, EXCLUDE_ATTR_USER } from '../libs/constant';

const {
    User
} = models;

export async function getProfile(req, res, next) {
    try {
        const { email } = req.user;
        const user = await User.findByEmail(email);
        if (!user) return next();

        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export async function updateProfile(req, res, next) {
    try {
        const { password } = req.body;
        const { email } = req.user;

        const user = await User.findByEmail(email);
        if (!user) return next();

        if (password) {
            await Promise.all(generalFormPassword.map(validation => validation.run(req)));
        }

        const errors = costumeValidationResult(req);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                data: errors
            });
        }

        const data = _.omit(req.body, ATTRIBUTES_ROLE);
        await user.update(data);

        return res.status(200).json(_.omit(user.toJSON(), EXCLUDE_ATTR_USER));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: JSON.stringify(err) });
    }
}

export default {};