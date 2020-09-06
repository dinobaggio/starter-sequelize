import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UniqueTokenStrategy } from 'passport-unique-token';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import models from '../models';
import { STATUS_VERIFIED } from '../libs/constant';


export const privateKey = fs.readFileSync('private.key').toString('utf8');

const { User } = models;

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new LocalStrategy(
    function(email, password, cb) {
        User.findByEmail(email).then(user => {
            if (!user) return cb(null, false);
            if (!bcrypt.compareSync(password, user.password)) {
                return cb(null, false);
            }

            if (user.isAdmin === false && Number(user.status) !== STATUS_VERIFIED.VERIFIED) {
                return cb(null, false);
            }

            return cb(null, _.omit(user.toJSON(), ['password']));
        }).catch((err) => {
            console.error(err);
            return cb(null, false);
        });
    })
);

const strategyOptions = {
    tokenQuery:    'authorization',
    tokenParams:     'authorization',
    tokenField:     'authorization',
    tokenHeader:     'authorization',
    failedOnMissing: false
};

passport.use(new UniqueTokenStrategy(strategyOptions, function(token, cb) {
    jwt.verify(token, privateKey, async function (err, decoded) {
        try {
            if (!decoded) return cb(null, false);
            const { email } = decoded;
            const user = await User.findByEmail(email);
            if (err) return cb(null, false);

            if (user.isAdmin === false && Number(user.status) !== STATUS_VERIFIED.VERIFIED) return cb(null, false);

            if (new Date(decoded.updatedAt).toString() !== new Date(user.updatedAt).toString()) {
                if (
                    user.isAdmin !== decoded.isAdmin
                ) {
                    return cb({ status: 401, message: 'Login anda expaired silahkan login kembali' }, false);
                }
            }

            return cb(null, user);
        } catch (error) {
            console.error(error);
            return cb(error);
        }
    });
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findOne({ where: { id } }).then(user => {
        if (!user) return cb(null, false);
        return cb(null, user);
    }).catch(err => cb(err));
});

export default passport;