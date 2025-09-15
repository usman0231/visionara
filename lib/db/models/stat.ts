import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface StatAttributes {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface StatCreationAttributes extends Optional<StatAttributes, 'id' | 'prefix' | 'suffix' | 'sortOrder' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  // This interface has required fields: label, value
}

export class Stat extends Model<StatAttributes, StatCreationAttributes> implements StatAttributes {
  public id!: string;
  public label!: string;
  public value!: number;
  public prefix!: string | null;
  public suffix!: string | null;
  public sortOrder!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Stat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suffix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Stat',
    tableName: 'stats',
    timestamps: true,
    paranoid: true,
  }
);

export default Stat;