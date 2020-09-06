import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class PermissionRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PermissionRole.init({
    RoleId: DataTypes.INTEGER,
    PermissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PermissionRole'
  });
  return PermissionRole;
};