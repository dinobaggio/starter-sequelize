import fs from 'fs';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { sendingEmail, htmlValidateEmail } from '../modules/mailing';
import models from '../models';
import passport from '../modules/passport';
import {costumeValidationResult, formLogin} from '../modules/validator';
import {DIRECT_EMAIL_URL, STATUS_VERIFIED} from '../libs/constant';

const {
    User
} = models;

export const privateKey = fs.readFileSync('private.key').toString('utf8');

export function verifyToken(roles = []) {
    return function (req, res, next) {
        passport.authenticate('token', function (err, user, info) {
            if (err) { return res.status(err.status || 401).json({ message: err.message || 'Login anda expired silahkan login kembali' }); }
            if (info) { return res.status(401).json({ message: 'Login anda expired silahkan login kembali' }); }
            if (!user) { return res.status(401).json({ message: 'Login anda expired silahkan login kembali' }); }

            if (roles.length > 0) {
                let accessGranted = false;

                roles.forEach(item => {
                   switch (item) {
                       case 'admin' :
                           if (user.isAdmin === true) accessGranted = true;
                           break;
                       default :
                           accessGranted = false;
                   }
                });

                if (accessGranted === false) { return res.status(403).json({ message: 'Anda tidak memiliki hak akses' }); }
            }

            req.user = user;
            next();
        })(req, res, next);
    };
}

export async function preLogin(req, res, next) {
    // await Promise.all(formLogin.map(validation => validation.run(req)));
    const errors = costumeValidationResult(req);
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Bad Request',
            data: errors
        });
    }

    if (req.body.email) req.body.username = req.body.email; // for authenticate passportjs login purpose
    return passport.authenticate('local', function (err, user, info) {
        if (err) { return res.status(500).json({ message: err }); }
        if (info) { return res.status(500).json(info); }
        if (!user) { return res.status(401).json({ message: 'Email atau password salah!' }); }
        req.user = user;
        next();
    })(req, res, next);
}

export function login(req, res) {
    try {
        const token = jwt.sign(
            req.user,
            privateKey,
            {
                expiresIn: '7d'
            }
        );

        return res.status(200).json({
            ..._.omit(req.user, ['password', 'createdAt', 'updatedAt', 'deletedAt', 'emailVerifiedAt']),
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

export async function register(req, res) {
    try {
        const errors = costumeValidationResult(req);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                data: errors
            });
        }

        const result = await User.registerUser(req);

        const { email } = req.body;
        const { host } = req.headers;
        const token = jwt.sign(
            result,
            privateKey,
            {
                expiresIn: '7d'
            }
        );

        // work asynchronously, better not add 'await'
        // this is for sending email
        // sendingEmail({
        //     from: '"Fred Foo 👻" <foo@example.com>', // sender address
        //     to: email, // list of receivers
        //     subject: 'Validasi Email', // Subject line
        //     text: 'Validasi Email', // plain text body
        //     html: htmlValidateEmail({
        //         token,
        //         host
        //     }), // html body
        // });

        return res.status(201).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

export async function validateEmailRegister(req, res) {
    const { token } = req.params;
    jwt.verify(token, privateKey, async function (err, decoded) {
        try {
            if (err) {
                console.error(err);
                return res.status(404).json({
                    message: 'Url tidak ditemukan'
                });
            }

            const user = await User.findByEmail(decoded.email, models);

            if (user.emailVerifiedAt === null && Number(user.status) === STATUS_VERIFIED.UNVERIFIED) {
                await Promise.all([
                    user.update({
                        emailVerifiedAt: new Date()
                    }),
                    user[type].update({
                        status: STATUS_VERIFIED.VERIFIED
                    })
                ]);
            }

            return res.render('validate', { redirectTo: DIRECT_EMAIL_URL });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Internal server error',
            });
        }
    });
}

export default { login, preLogin, verifyToken, register, validateEmailRegister };