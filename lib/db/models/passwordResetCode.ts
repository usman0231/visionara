import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

interface PasswordResetCodeAttributes {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PasswordResetCodeCreationAttributes
  extends Optional<PasswordResetCodeAttributes, 'id' | 'usedAt' | 'createdAt' | 'updatedAt'> {}

export class PasswordResetCode
  extends Model<PasswordResetCodeAttributes, PasswordResetCodeCreationAttributes>
  implements PasswordResetCodeAttributes
{
  public id!: string;
  public userId!: string;
  public codeHash!: string;
  public expiresAt!: Date;
  public usedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordResetCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PasswordResetCode',
    tableName: 'password_reset_codes',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['expiresAt'] },
      { fields: ['usedAt'] },
    ],
  }
);

export default PasswordResetCode;

