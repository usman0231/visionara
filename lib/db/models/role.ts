import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export enum RoleName {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  MEMBER = 'Member'
}

interface RoleAttributes {
  id: string;
  name: RoleName;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: string;
  declare name: RoleName;
  declare permissions: Record<string, any>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(...Object.values(RoleName)),
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {},
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
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
  }
);

export default Role;