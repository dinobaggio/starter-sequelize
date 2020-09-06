import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Role.belongsToMany(models.User, { through: 'UserRoles' });
      models.User.belongsToMany(models.Role, { through: 'UserRoles' });
    }
  };
  UserRole.init({
    UserId: DataTypes.BIGINT,
    RoleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserRole',
    paranoid: true,
  });

  return UserRole;
};