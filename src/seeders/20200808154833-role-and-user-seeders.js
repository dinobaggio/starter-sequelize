import bcrypt from 'bcryptjs';
import models from '../models';
import {STATUS_VERIFIED} from '../libs/constant';

const {
    Role,
    User
} = models;

export default {
    up: async (queryInterface, Sequelize) => {
        try {
            await Role.create({
                title: 'User'
            });

            const adminRole = await Role.create({
                title: 'Admin'
            });

            const adminUser = await User.create({
                name: 'Admin',
                email: 'admin@admin.com',
                password: bcrypt.hashSync('ubahsaya123', 8),
                isAdmin: true,
                status: STATUS_VERIFIED.VERIFIED,
                emailVerifiedAt: new Date()
            });
            await adminUser.addRole(adminRole);
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    down: async (queryInterface, Sequelize) => {
        // WILL BE DELETE EVERYTHING WITHOUT NOTICE !!!
        // await sequelize
        //     .query('SET FOREIGN_KEY_CHECKS = 0')
        // await User.destroy({ truncate: true });
        // await Role.destroy({ truncate: true });
        return true;
    }
};
