import bcrypt from 'bcryptjs';
import _ from 'lodash';
import sequelizePaginate from 'sequelize-paginate';
import validator from 'validator';

import { EXCLUDE_ATTR_USER, STATUS_VERIFIED } from '../libs/constant';

export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        isAdmin: DataTypes.BOOLEAN,
        isUser: DataTypes.BOOLEAN,
        status: DataTypes.TINYINT, // 0: blocked 1: active / unvalidate 2: validate
        emailVerifiedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'User',
        paranoid: true,
    });
    User.associate = function (models) {
        User.belongsToMany(models.Role, { through: 'UserRoles' });

        User.findByEmail = async function (email) {
            const user = await User.findOne({
                attributes: { exclude: ['deletedAt'] },
                where: { email },
            });

            return user;
        };

        User.registerUser = async function (req) {
            // not admin register
            const user = await User.create({
                ...req.body,
                password: bcrypt.hashSync(req.body.password, 8),
                isAdmin: false,
                isUser: true,
            });

            const userRole = await models.Role.findOne({
                where: {
                    title: 'User'
                }
            });
            await user.addRole(userRole);
            return user;
        };

        User.createUser = async function (req) {
            let { isAdmin, isUser } = req.body;
            if (isAdmin) isAdmin = validator.toBoolean(isAdmin);
            if (isUser) isUser = validator.toBoolean(isUser);

            let data = {
                ...req.body,
                emailVerifiedAt: new Date(),
                password: bcrypt.hashSync(req.body.password, 8),
            };
            if (isAdmin) {
                data = {
                    ...data,
                    isAdmin: true,
                    isUser: false,
                };
            } else if (isUser) {
                data = {
                    ...data,
                    isAdmin: false,
                    isUser: true,
                };
            }

            const user = await User.create(data);

            let role;

            if (isAdmin) {
                role = await models.Role.findOne({
                    where: {
                        title: 'Admin'
                    }
                });
            }

            if (isUser) {
                role = await models.Role.findOne({
                    where: {
                        title: 'User'
                    }
                });
            }
            await user.addRole(role);
            return user;
        };
    };

    sequelizePaginate.paginate(User);

    return User;
};