import express from 'express';
import {
    AuthController,
    RoleController,
} from '../controllers';
import { ROLES } from '../libs/constant';

const router = express.Router();

router.get('/',
    AuthController.verifyToken([ROLES.ADMIN]),
    RoleController.getAllRole
);

router.get('/:id',
    AuthController.verifyToken([ROLES.ADMIN]),
    RoleController.getRole
);


export default router;
