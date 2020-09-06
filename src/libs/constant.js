/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';

dotenv.config();

const _DIRECT_EMAIL_URL = {
    production: 'https://google.com',
    staging: 'https://google.com',
    development: 'https://google.com'
};

export const DIRECT_EMAIL_URL = _DIRECT_EMAIL_URL[process.env.ENV || 'development'];

export const STATUS_VERIFIED = {
    BLOCKED: 0,
    UNVERIFIED: 1,
    VERIFIED: 2,
};

export const ROLES = {
    ADMIN: 'admin'
};

export const ALLOW_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:42055',
    'http://localhost:5000',
    'http://localhost:3020',
];

export const ATTRIBUTES_ROLE = [
    'isAdmin',
    'isUser',
];

export const EXCLUDE_ATTR_USER = [
    'password'
];

export default {};
