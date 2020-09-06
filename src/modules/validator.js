/* eslint-disable no-self-compare,prefer-promise-reject-errors,consistent-return */
import _ from 'lodash';
import { body, param, validationResult } from 'express-validator';
import validator from 'validator';
import models from '../models';
const {
    User
} = models;

export function costumeValidationResult(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errors.array().map(item => ({
            field: item.param,
            error: item.msg
        }));
    }
    return [];
}

export const formLogin = [
    body('email')
        .notEmpty().withMessage('Email tidak boleh kosong')
        .isEmail().withMessage('Email tidak sesuai format'),
    body('password').notEmpty().withMessage('Password tidak boelh kosong')
];

export const generalFormInputSelf = [
    body('name')
        .notEmpty().withMessage('Nama tidak boleh kosong')
        .isString().withMessage('Nama tidak sesuai format'),
    body('email')
        .notEmpty().withMessage('Email tidak boleh kosong')
        .isEmail().withMessage('Email tidak sesuai format')
        .custom((value, { req }) => {
            const currentEmail = _.get(req, 'user.email', null);

            if (value !== currentEmail) {
                return User.findByEmail(value || '').then(user => {
                    if (user) {
                        return Promise.reject('Email sudah digunakan');
                    }
                });
            }

            return true;
        }),
];

export const generalFormInput = [
    body('name')
        .notEmpty().withMessage('Nama tidak boleh kosong')
        .isString().withMessage('Nama tidak sesuai format'),
    body('email')
        .notEmpty().withMessage('Email tidak boleh kosong')
        .isEmail().withMessage('Email tidak sesuai format')
        .custom(async (value, { req }) => {
            const { id } = req.params;
            let currentEmail = null;

            if (id) {
                ({ email: currentEmail } = await User.findByPk(id) || {});
            }

            if (value !== currentEmail) {
                return User.findByEmail(value || '').then(user => {
                    if (user) {
                        return Promise.reject('Email sudah digunakan');
                    }
                });
            }

            return true;
        }),
];

export const generalFormPassword = [
    body('password')
        .notEmpty().withMessage('Password tidak boleh kosong')
        .isLength({ min: 8 }).withMessage('Password tidak boleh lebih kecil dari 8')
        .custom(value => {
            if (value) {
                const password = value.replace(' ', '');
                const regex = new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/);
                if (!regex.test(password)) {
                    return Promise.reject('Password harus menggunakan kombinasi angka, huruf, dan karakter spesial');
                }
            }

            return true;
        }),
    body('passwordConfirm')
        .notEmpty().withMessage('Konfirmasi password tidak boleh kosong')
        .custom((value, { req }) => {
            if (value) {
                const { password } = req.body;
                if (value !== password) {
                    return Promise.reject('Konfirmasi password tidak sama');
                }
            }
            return true;
        })
];

export const formRegistration = [
    ...generalFormInput,
    ...generalFormPassword,
];

export const formCreateUser = [
    ...generalFormInput,
    body('isAdmin')
        .notEmpty().withMessage('isAdmin tidak boleh kosong')
        .custom(value => {
            if (value && !validator.isBoolean(value)) {
                throw new Error('isAdmin tidak sesuai format');
            }
            return true;
        })
];

export default {};
