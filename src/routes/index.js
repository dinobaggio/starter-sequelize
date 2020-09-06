import express from 'express';
import * as Validator from '../modules/validator';
import {
    AuthController,
} from '../controllers';

const router = express.Router();

router.post('/login',
    Validator.formLogin,
    AuthController.preLogin,
    AuthController.login
);

router.get('/register/validate/:token',
    AuthController.validateEmailRegister
);

router.post('/register',
    Validator.formRegistration,
    AuthController.register
);

export default router;
