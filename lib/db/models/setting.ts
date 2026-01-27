import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface SettingAttributes {
  id: string;
  key: string;
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingCreationAttributes extends Optional<SettingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Setting extends Model<SettingAttributes, SettingCreationAttributes> implements SettingAttributes {
  declare id: string;
  declare key: string;
  declare value: Record<string, any>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Setting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
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
    modelName: 'Setting',
    tableName: 'settings',
    timestamps: true,
  }
);

export default Setting;