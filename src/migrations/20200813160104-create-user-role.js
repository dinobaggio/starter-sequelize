'use strict';
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserRoles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      RoleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserRoles');
  }
};