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
  deletedAt: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'displayName' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public displayName!: string | null;
  public roleId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public role?: Role;
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
  }
);

// Associations
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

export default User;