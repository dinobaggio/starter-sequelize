import sequelizePaginate from 'sequelize-paginate';

export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Role',
    paranoid: true,
  });
  Role.associate = function(models) {
    Role.belongsToMany(models.User, {through: 'UserRoles'});
  };

  sequelizePaginate.paginate(Role);

  return Role;
};