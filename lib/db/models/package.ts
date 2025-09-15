import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export enum PackageCategory {
  WEB = 'Web',
  MOBILE = 'Mobile',
  GRAPHIC = 'Graphic',
  MARKETING = 'Marketing'
}

export enum PackageTier {
  BASIC = 'Basic',
  STANDARD = 'Standard',
  ENTERPRISE = 'Enterprise'
}

interface PackageAttributes {
  id: string;
  category: PackageCategory;
  tier: PackageTier;
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface PackageCreationAttributes extends Optional<PackageAttributes, 'id' | 'sortOrder' | 'active' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
  public id!: string;
  public category!: PackageCategory;
  public tier!: PackageTier;
  public priceOnetime!: string;
  public priceMonthly!: string;
  public priceYearly!: string;
  public features!: string[];
  public sortOrder!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Package.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(PackageCategory)),
      allowNull: false,
    },
    tier: {
      type: DataTypes.ENUM(...Object.values(PackageTier)),
      allowNull: false,
    },
    priceOnetime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priceMonthly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priceYearly: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
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
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['category', 'tier'],
        where: {
          deletedAt: null,
        },
      },
    ],
  }
);

export default Package;