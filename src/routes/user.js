import express from 'express';
import * as Validator from '../modules/validator';
import {
    AuthController,
    UserController
} from '../controllers';
import { ROLES } from '../libs/constant';

const router = express.Router();

router.get('/',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.getAllUser
);

router.post('/',
    AuthController.verifyToken([ROLES.ADMIN]),
    Validator.formCreateUser,
    Validator.generalFormPassword,
    UserController.createUser
);

router.get('/:id',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.getUser
);

router.put('/:id',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.updateUser
);

router.put('/:id/validate',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.validateUser
);

router.put('/:id/block',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.blockUser
);

router.delete('/:id',
    AuthController.verifyToken([ROLES.ADMIN]),
    UserController.deleteUser
);

export default router;
