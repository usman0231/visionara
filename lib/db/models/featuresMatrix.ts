import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export enum ServiceKey {
  WEB = 'web',
  MOBILE = 'mobile', 
  GRAPHIC = 'graphic',
  MARKETING = 'marketing'
}

export enum PlanKey {
  BASIC = 'basic',
  STANDARD = 'standard',
  ENTERPRISE = 'enterprise'
}

interface FeaturesMatrixAttributes {
  id: string;
  serviceKey: ServiceKey;
  planKey: PlanKey;
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  tag: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface FeaturesMatrixCreationAttributes extends Optional<FeaturesMatrixAttributes, 'id' | 'tag' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class FeaturesMatrix extends Model<FeaturesMatrixAttributes, FeaturesMatrixCreationAttributes> implements FeaturesMatrixAttributes {
  public id!: string;
  public serviceKey!: ServiceKey;
  public planKey!: PlanKey;
  public priceOnetime!: string;
  public priceMonthly!: string;
  public priceYearly!: string;
  public tag!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

FeaturesMatrix.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serviceKey: {
      type: DataTypes.ENUM(...Object.values(ServiceKey)),
      allowNull: false,
    },
    planKey: {
      type: DataTypes.ENUM(...Object.values(PlanKey)),
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
    tag: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'FeaturesMatrix',
    tableName: 'features_matrix',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['serviceKey', 'planKey'],
        where: {
          deletedAt: null,
        },
      },
    ],
  }
);

export default FeaturesMatrix;