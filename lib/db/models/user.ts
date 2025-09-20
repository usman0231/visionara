import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import Role from './role';

interface UserAttributes {
  id: string; // matches Supabase auth.user.id
  email: string;
  displayName: string | null;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'displayName' | 'createdAt' | 'updatedAt'> {
  // This interface has required fields: id, email, roleId
}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare displayName: string | null;
  declare roleId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations
  declare role?: Role;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      comment: 'Matches Supabase auth.user.id',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

// Associations
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

export default User;