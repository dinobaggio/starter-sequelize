import express from 'express';
import {
    AuthController,
    ProfileController
} from '../controllers';
import * as Validator from '../modules/validator';

const router = express.Router();

router.get('/',
    AuthController.verifyToken(),
    ProfileController.getProfile,
);

router.put('/',
    AuthController.verifyToken(),
    Validator.generalFormInputSelf,
    ProfileController.updateProfile,
);


export default router;
